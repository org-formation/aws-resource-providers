import { Organizations } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Optional, CfnResponse, SessionProxy, ProgressEvent } from 'cfn-rpdk';

import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     */
    @handlerEvent(Action.Create)
    @commonAws({
        serviceName: 'Organizations',
        debug: true,
    })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations): Promise<ResourceModel> {
        const { desiredResourceState } = args.request;
        const model: ResourceModel = desiredResourceState;

        const response = await service
            .createPolicy({
                Content: model.content,
                Description: model.description,
                Name: model.name,
                Type: model.policyType,
            })
            .promise();
        model.resourceId = response.Policy.PolicySummary.Id;
        console.info({ action, message: 'policy creation', policyId: model.resourceId });
        await service
            .attachPolicy({
                PolicyId: model.resourceId,
                TargetId: model.targetId,
            })
            .promise();
        console.info({ action, message: 'target ID attachment', targetId: model.targetId });
        return Promise.resolve(model);
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     */
    @handlerEvent(Action.Update)
    @commonAws({
        serviceName: 'Organizations',
        debug: true,
    })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations): Promise<ResourceModel> {
        const { desiredResourceState } = args.request;
        const model: ResourceModel = desiredResourceState;
        const policyId = model.resourceId;

        await service
            .updatePolicy({
                Content: model.content,
                Description: model.description,
                Name: model.name,
                PolicyId: policyId,
            })
            .promise();
        console.info({ action, message: 'policy updated', policyId: policyId });

        return Promise.resolve(model);
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     */
    @handlerEvent(Action.Delete)
    @commonAws({
        serviceName: 'Organizations',
        debug: true,
    })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations): Promise<null> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;

        const model: ResourceModel = desiredResourceState;
        const policyId = model.resourceId;
        const targetId = model.targetId;
        try {
            await service
                .detachPolicy({
                    PolicyId: policyId,
                    TargetId: targetId,
                })
                .promise();
            console.info({ action, message: 'policy detached', policyId: policyId, targetId: targetId });
        } catch (err) {}

        await service
            .deletePolicy({
                PolicyId: policyId,
            })
            .promise();
        console.info({ action, message: 'policy deleted', policyId: policyId });

        return Promise.resolve(null);
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
