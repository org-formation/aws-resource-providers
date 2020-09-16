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

    const comparablesToDelete = previousComparables.filter(x=>!desiredCompareables.includes(x));
    const comparablesToCreate = desiredCompareables.filter(x=>!previousComparables.includes(x));

    const promises: Promise<any>[] = [];
    for(const deletable of comparablesToDelete) {
        const assignmentRequest: DeleteAccountAssignmentRequest = {
            ... splitComparable(deletable),
            InstanceArn: desiredModel.instanceArn,
            PrincipalId: desiredModel.principalId,
            PrincipalType: desiredModel.principalType
        };
        const assignmentPromise = service.deleteAccountAssignment(assignmentRequest).promise();
        promises.push(assignmentPromise);
        
    }

    for(const creatable of comparablesToCreate) {
        const createAssignmentRequest: CreateAccountAssignmentRequest = {
            ... splitComparable(creatable),
            InstanceArn: desiredModel.instanceArn,
            PrincipalId: desiredModel.principalId,
            PrincipalType: desiredModel.principalType
        };
        const assignmentPromise = service.createAccountAssignment(createAssignmentRequest).promise();
        promises.push(assignmentPromise);
    }

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

        model.resourceId = `arn:community::${accountId}:principal-assignments:${model.principalType}:${model.principalId}`;
        
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
