import { Action, BaseResource, exceptions, handlerEvent, Logger } from 'cfn-rpdk';
import { ResourceModel } from './models';
import { SSOAdmin } from 'aws-sdk';
import { InternalFailure } from 'cfn-rpdk/dist/exceptions';
import { v4 as uuidv4 } from 'uuid';
import { DeleteAccountAssignmentRequest, CreateAccountAssignmentRequest } from 'aws-sdk/clients/ssoadmin';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';

const versionCode = '1';

interface LogContext {
    handler: string;
    versionCode: string;
    clientRequestToken: string;
}

type CallbackContext = Record<string, any>;

const enumeratePermissionSetArns = (model: ResourceModel): string[] => {
    if (model.permissionSets === undefined) {
        return [];
    }
    const instanceArn = model.instanceArn;
    const instanceArnParts = instanceArn.split('/');
    const instanceId = instanceArnParts[instanceArnParts.length - 1];

    const createArnIfId = (arnOrId: string): string => {
        if (arnOrId.startsWith('arn')) {
            if (arnOrId.indexOf('|arn') > -1) {
                return arnOrId.substring(arnOrId.lastIndexOf('arn'));
            }
            return arnOrId;
        }
        return `arn:aws:sso:::permissionSet/${instanceId}/${arnOrId}`;
    };

    return model.permissionSets.map((x) => createArnIfId(x));
};

const enumerateAccountIds = async (model: ResourceModel): Promise<string[]> => {
    if (model.targets === undefined) {
        return [];
    }
    const result: string[] = [];
    const accountIdTargets = model.targets.filter((x) => x.targetType === 'AWS_ACCOUNT');
    const ouIdTargets = model.targets.filter((x) => x.targetType === 'AWS_OU');

    const flattenedAccountIds = accountIdTargets.map((x) => x.targetIds).reduce((x, y) => y.concat(x), []);
    result.push(...flattenedAccountIds);

    if (ouIdTargets.length > 0) {
        throw new exceptions.InternalFailure(`Target with type AWS_OU not supported yet`);
    }

    return result;
};

const enumerateComparables = async (model: ResourceModel): Promise<string[]> => {
    const result: string[] = [];
    const permissionSetArns = enumeratePermissionSetArns(model);
    const accountIds = await enumerateAccountIds(model);

    for (const permissionSetArn of permissionSetArns) {
        for (const accountId of accountIds) {
            result.push(`${accountId}|${permissionSetArn}`);
        }
    }
    return result;
};

interface AssignmentTarget {
    TargetId: string;
    TargetType: 'AWS_ACCOUNT' | string;
    PermissionSetArn: string;
}

const splitComparable = (comparable: string): AssignmentTarget => {
    const parts = comparable.split('|');
    return {
        TargetType: 'AWS_ACCOUNT',
        TargetId: parts[0],
        PermissionSetArn: parts[parts.length - 1],
    };
};

const retryCreateOrDeleteOperation = async (operation: () => Promise<void>, logger: Logger) => {
    let shouldRetry = false;
    let retryCount = 0;
    do {
        shouldRetry = false;
        try {
            return await operation();
        } catch (err) {
            if (err && (err.retryable || err.code === 'ConflictException' || err.code === 'ConcurrentModificationException' || err.code === 'TooManyRequestsException') && retryCount < 3) {
                retryCount = retryCount + 1;
                shouldRetry = true;
                const wait = Math.pow(retryCount, 2) + Math.random();
                logger.log(`received retryable error ${err}. wait ${wait} and retry-count ${retryCount}`);

                await sleep(wait * 1000);
                continue;
            }
            throw err;
        }
    } while (shouldRetry);
};

const compareCreateAndDelete = async (service: SSOAdmin, loggingContext: LogContext, previousModel: ResourceModel, desiredModel: ResourceModel, logger: Logger) => {
    const [previousComparables, desiredCompareables] = await Promise.all([await enumerateComparables(previousModel), await enumerateComparables(desiredModel)]);

    logger.log({ ...loggingContext, method: 'compareCreateAndDelete', previousComparables, desiredCompareables });

    const getHasAssignment = async (assignmentRequest: DeleteAccountAssignmentRequest | CreateAccountAssignmentRequest): Promise<boolean | undefined> => {
        if (assignmentRequest.TargetType !== 'AWS_ACCOUNT') {
            return undefined;
        }

        let response: SSOAdmin.ListAccountAssignmentsResponse = {};

        do {
            const request: SSOAdmin.ListAccountAssignmentsRequest = {
                InstanceArn: assignmentRequest.InstanceArn,
                AccountId: assignmentRequest.TargetId,
                PermissionSetArn: assignmentRequest.PermissionSetArn,
                NextToken: response.NextToken,
            };
            response = await service.listAccountAssignments(request).promise();

            if (response.AccountAssignments && response.AccountAssignments.find((x) => x.PrincipalId === assignmentRequest.PrincipalId)) {
                return true;
            }
        } while (response.NextToken);

        return false;
    };

    const deleteAndWait = async (assignmentRequest: DeleteAccountAssignmentRequest): Promise<void> => {
        logger.log({ ...loggingContext, method: 'before deleteAndWait', assignmentRequest });
        const response = await service.deleteAccountAssignment(assignmentRequest).promise();

        const getHasAssignments = await getHasAssignment(assignmentRequest);
        if (getHasAssignments === false) {
            logger.log({ ...loggingContext, message: 'no assignment found, skipping', method: 'deleteAndWait', assignmentRequest });
            return;
        }

        let deletionStatus = response.AccountAssignmentDeletionStatus;
        while (deletionStatus && deletionStatus.Status === 'IN_PROGRESS') {
            await sleep(2000);
            const describeDeleteAssignmentRequest = { AccountAssignmentDeletionRequestId: deletionStatus.RequestId, InstanceArn: assignmentRequest.InstanceArn };

            const describeStatusResponse = await service.describeAccountAssignmentDeletionStatus(describeDeleteAssignmentRequest).promise();
            deletionStatus = describeStatusResponse.AccountAssignmentDeletionStatus;
        }

        logger.log({ ...loggingContext, method: 'after deleteAndWait', assignmentRequest, deletionStatus });
        if (deletionStatus.Status !== 'SUCCEEDED') {
            throw new InternalFailure(`${deletionStatus.FailureReason}:${assignmentRequest.PrincipalId}, ${assignmentRequest.TargetId} ${assignmentRequest.PermissionSetArn}`);
        }
    };

    const createAndWait = async (createAssignmentRequest: CreateAccountAssignmentRequest): Promise<void> => {
        logger.log({ ...loggingContext, method: 'before createAndWait', createAssignmentRequest });

        const response = await service.createAccountAssignment(createAssignmentRequest).promise();

        const getHasAssignments = await getHasAssignment(createAssignmentRequest);
        if (getHasAssignments === true) {
            logger.log({ ...loggingContext, message: 'assignment already made, skipping', method: 'createAndWait', createAssignmentRequest });
            return;
        }

        let creationStatus = response.AccountAssignmentCreationStatus;
        while (creationStatus && creationStatus.Status === 'IN_PROGRESS') {
            await sleep(2000);
            const describeCreateAssignmentRequest = { AccountAssignmentCreationRequestId: creationStatus.RequestId, InstanceArn: createAssignmentRequest.InstanceArn };

            const describeStatusResponse = await service.describeAccountAssignmentCreationStatus(describeCreateAssignmentRequest).promise();
            creationStatus = describeStatusResponse.AccountAssignmentCreationStatus;
        }

        logger.log({ ...loggingContext, method: 'after createAndWait', createAssignmentRequest, creationStatus });
        if (creationStatus.Status !== 'SUCCEEDED') {
            throw new InternalFailure(`${creationStatus.FailureReason}: ${createAssignmentRequest.PrincipalId}, ${createAssignmentRequest.TargetId} ${createAssignmentRequest.PermissionSetArn}`);
        }
    };

    const comparablesToDelete = previousComparables.filter((x) => !desiredCompareables.includes(x));
    const comparablesToCreate = desiredCompareables.filter((x) => !previousComparables.includes(x));
    logger.log({ ...loggingContext, method: 'compareCreateAndDelete', comparablesToDelete, comparablesToCreate });

    logger.log({ ...loggingContext, method: 'before deleting', comparablesToDelete });
    for (const deletable of comparablesToDelete) {
        const assignmentRequest: DeleteAccountAssignmentRequest = {
            ...splitComparable(deletable),
            InstanceArn: previousModel.instanceArn,
            PrincipalId: previousModel.principalId,
            PrincipalType: previousModel.principalType,
        };
        await retryCreateOrDeleteOperation(async () => await deleteAndWait(assignmentRequest), logger);
    }
    logger.log({ ...loggingContext, method: 'after deleting', comparablesToDelete });

    logger.log({ ...loggingContext, method: 'before creating', comparablesToCreate });
    for (const creatable of comparablesToCreate) {
        const createAssignmentRequest: CreateAccountAssignmentRequest = {
            ...splitComparable(creatable),
            InstanceArn: desiredModel.instanceArn,
            PrincipalId: desiredModel.principalId,
            PrincipalType: desiredModel.principalType,
        };
        await retryCreateOrDeleteOperation(async () => await createAndWait(createAssignmentRequest), logger);
    }
    logger.log({ ...loggingContext, method: 'after creating', comparablesToCreate });
};

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SSOAdmin, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SSOAdmin, model: ResourceModel): Promise<ResourceModel> {
        const { clientRequestToken, awsAccountId } = args.request;
        const { logger, request, callbackContext } = args;

        const loggingContext: LogContext = { handler: action, clientRequestToken, versionCode };

        logger.log({ ...loggingContext, request, callbackContext });

        model.resourceId = `arn:community::${awsAccountId}:principal-assignments:${model.principalType}:${model.principalId}/${uuidv4()}`;

        await compareCreateAndDelete(service, loggingContext, new ResourceModel(), model, logger);

        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SSOAdmin, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SSOAdmin, model: ResourceModel): Promise<ResourceModel> {
        const { clientRequestToken, previousResourceState } = args.request;
        const { logger } = args;
        const previous = new ResourceModel(previousResourceState);

        const loggingContext: LogContext = { handler: action, clientRequestToken, versionCode };

        await compareCreateAndDelete(service, loggingContext, previous, model, logger);

        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SSOAdmin, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SSOAdmin, model: ResourceModel): Promise<ResourceModel> {
        const { clientRequestToken } = args.request;
        const { logger } = args;
        const loggingContext: LogContext = { handler: action, clientRequestToken, versionCode };

        await compareCreateAndDelete(service, loggingContext, model, new ResourceModel({}), logger);
        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ service: SSOAdmin, debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: SSOAdmin, model: ResourceModel): Promise<ResourceModel> {
        return Promise.resolve(model);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;

const sleep = (time: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, time));
};
