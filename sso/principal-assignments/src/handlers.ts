import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    HandlerErrorCode,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from 'cfn-rpdk';
import { ResourceModel } from './models';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { SSOAdmin } from 'aws-sdk';
import { CreateAccountAssignmentRequest, DeleteAccountAssignmentRequest } from 'aws-sdk/clients/ssoadmin';
import { InternalFailure } from 'cfn-rpdk/dist/exceptions';
import { v4 as uuidv4 } from 'uuid';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

interface CallbackContext extends Record<string, any> {}




const enumeratePermissionSetArns = (model: ResourceModel): string[] => {
    if (model.permissionSets === undefined) {
        return [];
    }
    const instanceArn = model.instanceArn;
    const instanceArnParts = instanceArn.split('/');
    const instanceId = instanceArnParts[instanceArnParts.length -1];

    const createArnIfId = (arnOrId: string): string => {
        if (arnOrId.startsWith('arn')) {
            return arnOrId;
        }
        return `arn:aws:sso:::permissionSet/${instanceId}/${arnOrId}`;
    };

    return model.permissionSets.map(x=>createArnIfId(x));
}

const enumerateAccountIds = async (model: ResourceModel): Promise<string[]> => {
    if (model.targets === undefined) {
        return [];
    }
    const result: string[] = [];
    const accountIdTargets = model.targets.filter(x=>x.targetType === 'AWS_ACCOUNT');
    const ouIdTargets = model.targets.filter(x=>x.targetType === 'AWS_OU');
    
    const flattenedAccountIds = accountIdTargets.map(x=>x.targetIds).reduce((x, y)=>y.concat(x), []);
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

    for(const permissionSetArn of permissionSetArns) {
        for(const accountId of accountIds) {
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
        PermissionSetArn: parts[1]
    };
} 

const compareCreateAndDelete = async (service: SSOAdmin, previousModel: ResourceModel, desiredModel: ResourceModel) => {
    const [previousComparables, desiredCompareables] = await Promise.all([
            await enumerateComparables(previousModel),
            await enumerateComparables(desiredModel) 
    ]);;

    LOGGER.info({method: 'compareCreateAndDelete', previousComparables, desiredCompareables});


    const deleteAndWait = async (assignmentRequest: DeleteAccountAssignmentRequest): Promise<void> => {

        LOGGER.info({method: 'before deleteAndWait', assignmentRequest});

        const response = await service.deleteAccountAssignment(assignmentRequest).promise();
        return;

        let deletionStatus = response.AccountAssignmentDeletionStatus;
        while(deletionStatus && deletionStatus.Status === 'IN_PROGRESS') {
            await sleep(1000);
            const describeStatusResponse = await service.describeAccountAssignmentDeletionStatus({AccountAssignmentDeletionRequestId: deletionStatus.RequestId, InstanceArn: assignmentRequest.InstanceArn}).promise();
            deletionStatus = describeStatusResponse.AccountAssignmentDeletionStatus;
        }

        LOGGER.info({method: 'after deleteAndWait', assignmentRequest, deletionStatus});

        if (deletionStatus.Status !== 'SUCCEEDED') {
            throw new InternalFailure(`unable to delete account assignment for ${assignmentRequest.PrincipalId}, ${assignmentRequest.TargetId} ${assignmentRequest.PermissionSetArn}`);
        }
        
    }


    const createAndWait = async (createAssignmentRequest: CreateAccountAssignmentRequest): Promise<void> => {
        LOGGER.info({method: 'before createAndWait', createAssignmentRequest});

        const response = await service.createAccountAssignment(createAssignmentRequest).promise();
        return;
        
        let creationStatus = response.AccountAssignmentCreationStatus;
        while(creationStatus && creationStatus.Status === 'IN_PROGRESS') {
            await sleep(1000);
            const describeStatusResponse = await service.describeAccountAssignmentCreationStatus({AccountAssignmentCreationRequestId: creationStatus.RequestId, InstanceArn: createAssignmentRequest.InstanceArn}).promise();
            creationStatus = describeStatusResponse.AccountAssignmentCreationStatus;
        }
    
        LOGGER.info({method: 'after createAndWait', createAssignmentRequest, creationStatus});

        if (creationStatus.Status !== 'SUCCEEDED') {
            throw new InternalFailure(`unable to delete account assignment for ${createAssignmentRequest.PrincipalId}, ${createAssignmentRequest.TargetId} ${createAssignmentRequest.PermissionSetArn}`);
        }
        
    }

    const comparablesToDelete = previousComparables.filter(x=>!desiredCompareables.includes(x));
    const comparablesToCreate = desiredCompareables.filter(x=>!previousComparables.includes(x));

    LOGGER.info({method: 'compareCreateAndDelete', comparablesToDelete, comparablesToCreate});

    LOGGER.info({method: 'before deleting', comparablesToDelete});
    let promises: Promise<any>[] = [];
    for(const deletable of comparablesToDelete) {
        const assignmentRequest: DeleteAccountAssignmentRequest = {
            ... splitComparable(deletable),
            InstanceArn: desiredModel.instanceArn,
            PrincipalId: desiredModel.principalId,
            PrincipalType: desiredModel.principalType
        };
        const assignmentPromise = deleteAndWait(assignmentRequest);
        promises.push(assignmentPromise);
    }
    await Promise.all(promises);
    promises = [];
    LOGGER.info({method: 'after deleting', comparablesToDelete});

    LOGGER.info({method: 'before creating', comparablesToCreate});
    
    for(const creatable of comparablesToCreate) {
        const createAssignmentRequest: CreateAccountAssignmentRequest = {
            ... splitComparable(creatable),
            InstanceArn: desiredModel.instanceArn,
            PrincipalId: desiredModel.principalId,
            PrincipalType: desiredModel.principalType
        };
        const assignmentPromise = createAndWait(createAssignmentRequest);
        promises.push(assignmentPromise);
    }
    LOGGER.info({method: 'after creating', comparablesToCreate});

    await Promise.all(promises);

}

class Resource extends BaseResource<ResourceModel> {

    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'SSOAdmin' })
    public async create(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: SSOAdmin
    ): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        const accountId = args.request.awsAccountId;

        model.resourceId = `arn:community::${accountId}:principal-assignments:${model.principalType}:${model.principalId}/${uuidv4()}`;
        
        await compareCreateAndDelete(service, new ResourceModel(), model);

        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'SSOAdmin' })
    public async update(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: SSOAdmin
    ): Promise<ResourceModel> {
        const desired = args.request.desiredResourceState;
        const previous = args.request.previousResourceState;
        
        await compareCreateAndDelete(service, previous, desired);
        
        return desired;   
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'SSOAdmin' })
    public async delete(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: SSOAdmin
    ): Promise<ResourceModel> {
        const desired = new ResourceModel();
        const previous = args.request.desiredResourceState;
        
        await compareCreateAndDelete(service, previous, desired);
        
        return desired;   
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;

const sleep = (time: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, time));
};
