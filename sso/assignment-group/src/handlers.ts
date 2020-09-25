import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from 'cfn-rpdk';
import { ResourceModel } from './models';
import SSOAdmin = require('../ssoadmin/ssoadmin');
import { CreateAccountAssignmentRequest, DeleteAccountAssignmentRequest } from '../ssoadmin/ssoadmin';
import { InternalFailure } from 'cfn-rpdk/dist/exceptions';
import { v4 as uuidv4 } from 'uuid';

const versionCode = '1';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

interface LogContext {
    handler: 'Create' | 'Update' | 'Delete',
    versionCode: string;
    clientRequestToken: string;
}

interface CallbackContext extends Record<string, any> { }

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

    return model.permissionSets.map(x => createArnIfId(x));
}

const enumerateAccountIds = async (model: ResourceModel): Promise<string[]> => {
    if (model.targets === undefined) {
        return [];
    }
    const result: string[] = [];
    const accountIdTargets = model.targets.filter(x => x.targetType === 'AWS_ACCOUNT');
    const ouIdTargets = model.targets.filter(x => x.targetType === 'AWS_OU');

    const flattenedAccountIds = accountIdTargets.map(x => x.targetIds).reduce((x, y) => y.concat(x), []);
    result.push(...flattenedAccountIds);

    if (ouIdTargets.length > 0) {
        throw new exceptions.InternalFailure(`Target with type AWS_OU not supported yet`);
    }

    return result;
}

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
}

interface AssignmentTarget {
    TargetId: string,
    TargetType: 'AWS_ACCOUNT' | string,
    PermissionSetArn: string
}

const splitComparable = (comparable: string): AssignmentTarget => {
    const parts = comparable.split('|');
    return {
        TargetType: 'AWS_ACCOUNT',
        TargetId: parts[0],
        PermissionSetArn: parts[parts.length - 1]
    };
}

const retryCreateOrDeleteOperation = async (operation: () => Promise<void>) => {
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
                LOGGER.info(`received retryable error ${err}. wait ${wait} and retry-count ${retryCount}`);
                await sleep(wait * 1000);
                continue;
            }
            throw err;
        }
    }
    while (shouldRetry);
}


const compareCreateAndDelete = async (service: SSOAdmin, loggingContext: LogContext, previousModel: ResourceModel, desiredModel: ResourceModel) => {

    LOGGER.info({ ...loggingContext, method: 'compareCreateAndDelete', previousModel, desiredModel });

    const [previousComparables, desiredCompareables] = await Promise.all([
        await enumerateComparables(previousModel),
        await enumerateComparables(desiredModel)
    ]);;

    LOGGER.info({ ...loggingContext, method: 'compareCreateAndDelete', previousComparables, desiredCompareables });

    const deleteAndWait = async (assignmentRequest: DeleteAccountAssignmentRequest): Promise<void> => {

        LOGGER.info({ ...loggingContext, method: 'before deleteAndWait', assignmentRequest });
        const response = await service.deleteAccountAssignment(assignmentRequest).promise();
        LOGGER.info({ ...loggingContext, method: 'delete assignment response', assignmentRequest, response });

        let deletionStatus = response.AccountAssignmentDeletionStatus;
        while (deletionStatus && deletionStatus.Status === 'IN_PROGRESS') {
            await sleep(2000);
            const describeDeleteAssignmentRequest = { AccountAssignmentDeletionRequestId: deletionStatus.RequestId, InstanceArn: assignmentRequest.InstanceArn };
            LOGGER.info({ ...loggingContext, method: 'before describe deletion status', assignmentRequest });
            const describeStatusResponse = await service.describeAccountAssignmentDeletionStatus(describeDeleteAssignmentRequest).promise();
            deletionStatus = describeStatusResponse.AccountAssignmentDeletionStatus;
            LOGGER.info({ ...loggingContext, method: 'after describe deletion status', deletionStatus });
        }

        LOGGER.info({ ...loggingContext, method: 'after deleteAndWait', assignmentRequest, deletionStatus });
        if (deletionStatus.Status !== 'SUCCEEDED') {
            throw new InternalFailure(`${deletionStatus.FailureReason}:${assignmentRequest.PrincipalId}, ${assignmentRequest.TargetId} ${assignmentRequest.PermissionSetArn}`);
        }
    }


    const createAndWait = async (createAssignmentRequest: CreateAccountAssignmentRequest): Promise<void> => {
        LOGGER.info({ ...loggingContext, method: 'before createAndWait', createAssignmentRequest });
        const response = await service.createAccountAssignment(createAssignmentRequest).promise();
        LOGGER.info({ ...loggingContext, method: 'create assignment response', createAssignmentRequest, response });

        let creationStatus = response.AccountAssignmentCreationStatus;
        while (creationStatus && creationStatus.Status === 'IN_PROGRESS') {
            await sleep(2000);
            const describeCreateAssignmentRequest = { AccountAssignmentCreationRequestId: creationStatus.RequestId, InstanceArn: createAssignmentRequest.InstanceArn };
            LOGGER.info({ ...loggingContext, method: 'before describe creation status', createAssignmentRequest });
            const describeStatusResponse = await service.describeAccountAssignmentCreationStatus(describeCreateAssignmentRequest).promise();
            creationStatus = describeStatusResponse.AccountAssignmentCreationStatus;
            LOGGER.info({ ...loggingContext, method: 'after describe creation status', creationStatus });
        }

        LOGGER.info({ ...loggingContext, method: 'after createAndWait', createAssignmentRequest, creationStatus });
        if (creationStatus.Status !== 'SUCCEEDED') {
            throw new InternalFailure(`${creationStatus.FailureReason}: ${createAssignmentRequest.PrincipalId}, ${createAssignmentRequest.TargetId} ${createAssignmentRequest.PermissionSetArn}`);
        }

    }

    const comparablesToDelete = previousComparables.filter(x => !desiredCompareables.includes(x));
    const comparablesToCreate = desiredCompareables.filter(x => !previousComparables.includes(x));

    LOGGER.info({ ...loggingContext, method: 'compareCreateAndDelete', comparablesToDelete, comparablesToCreate });

    LOGGER.info({ ...loggingContext, method: 'before deleting', comparablesToDelete });
    for (const deletable of comparablesToDelete) {
        const assignmentRequest: DeleteAccountAssignmentRequest = {
            ...splitComparable(deletable),
            InstanceArn: previousModel.instanceArn,
            PrincipalId: previousModel.principalId,
            PrincipalType: previousModel.principalType
        };
        await retryCreateOrDeleteOperation( async () => await deleteAndWait(assignmentRequest));
    }

    LOGGER.info({ ...loggingContext, method: 'after deleting', comparablesToDelete });

    LOGGER.info({ ...loggingContext, method: 'before creating', comparablesToCreate });
    for (const creatable of comparablesToCreate) {
        const createAssignmentRequest: CreateAccountAssignmentRequest = {
            ...splitComparable(creatable),
            InstanceArn: desiredModel.instanceArn,
            PrincipalId: desiredModel.principalId,
            PrincipalType: desiredModel.principalType
        };
        await retryCreateOrDeleteOperation( async () => await createAndWait(createAssignmentRequest));
    }
    LOGGER.info({ ...loggingContext, method: 'after creating', comparablesToCreate });

}

class Resource extends BaseResource<ResourceModel> {

    @handlerEvent(Action.Create)
    public async create(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        const loggingContext : LogContext = { handler: 'Create', clientRequestToken: request.clientRequestToken, versionCode };

        LOGGER.info({ ...loggingContext, request, callbackContext });
        try {
            const accountId = request.awsAccountId;

            model.resourceId = `arn:community::${accountId}:principal-assignments:${model.principalType}:${model.principalId}/${uuidv4()}`;

            if (session instanceof SessionProxy) {
                const options = (session as any).options;

                const service = new SSOAdmin(options);

                await compareCreateAndDelete(service, loggingContext, new ResourceModel(), model);
            } else {
                throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
            }

            progress.status = OperationStatus.Success;
        } catch (err) {
            console.info({ ...loggingContext, message: 'error', err });
            progress.status = OperationStatus.Failed;
        }

        LOGGER.info({ ...loggingContext, message: 'done', progress });
        return progress;
    }

    @handlerEvent(Action.Update)
    public async update(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        const previous: ResourceModel = request.previousResourceState;
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        const loggingContext : LogContext = { handler: 'Update', clientRequestToken: request.clientRequestToken, versionCode };

        LOGGER.info({ ...loggingContext, request, callbackContext });

        try {
            if (session instanceof SessionProxy) {
                const options = (session as any).options;

                const service = new SSOAdmin(options);

                await compareCreateAndDelete(service, loggingContext, previous, model);
            } else {
                throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
            }

            progress.status = OperationStatus.Success;

        } catch (err) {
            console.info({ ...loggingContext, handler: 'update', message: 'error', err });
            progress.status = OperationStatus.Failed;
        }
        LOGGER.info({ ...loggingContext, handler: 'update', message: 'done', progress });
        return progress;
    }


    @handlerEvent(Action.Delete)
    public async delete(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        const loggingContext : LogContext = { handler: 'Delete', clientRequestToken: request.clientRequestToken, versionCode };

        LOGGER.info({ ...loggingContext, request, callbackContext });

        try {
            if (session instanceof SessionProxy) {
                const options = (session as any).options;
                const service = new SSOAdmin(options);

                await compareCreateAndDelete(service, loggingContext, model, new ResourceModel({}));
            } else {
                throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
            }

            progress.status = OperationStatus.Success;

        } catch (err) {
            console.info({ ...loggingContext,  message: 'error', err });
            progress.status = OperationStatus.Failed;
        }
        LOGGER.info({ ...loggingContext, message: 'done', progress });
        return progress;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;

const sleep = (time: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, time));
};
