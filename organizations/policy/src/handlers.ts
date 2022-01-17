import { Organizations } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from 'cfn-rpdk';

import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    private async listPolicyTargets(service: Organizations, logger: Logger, policyId: string): Promise<Organizations.PolicyTargetSummary[]> {
        const policyTargets: Organizations.PolicyTargetSummary[] = [];
        let response: Organizations.ListTargetsForPolicyResponse = {};
        do {
            response = await service
                .listTargetsForPolicy({
                    PolicyId: policyId,
                    NextToken: response.NextToken,
                })
                .promise();
            logger.log({ message: 'targets for policy listed', policyId, response });
            policyTargets.push(...response.Targets);
        } while (response.NextToken);
        return Promise.resolve(policyTargets);
    }
    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     */
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'Organizations', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations, model: ResourceModel): Promise<ResourceModel> {
        if (model.resourceId) {
            throw new exceptions.InvalidRequest('Read only property [ResourceId] cannot be provided by the user.');
        }
        if (!model.policyDocument && !model.content) {
            throw new exceptions.InvalidRequest('Either PolicyDocument or Content must be specified.');
        }
        if (!!model.policyDocument && !!model.content) {
            throw new exceptions.InvalidRequest('Either PolicyDocument or Content must be specified.');
        }
        try {
            const request = {
                Content: model.content ?? serializeMap(model.policyDocument),
                Description: model.description,
                Name: model.name,
                Type: model.policyType,
            };
            args.logger.log(request);
            const response = await service.createPolicy(request).promise();
            model.resourceId = response.Policy.PolicySummary.Id;
            args.logger.log({ action, message: 'policy creation', policyId: model.resourceId, response });
        } catch (err) {
            if (err?.code === 'DuplicatePolicyException') {
                args.logger.log(err);
                throw new exceptions.AlreadyExists(this.typeName, model.name);
            } else {
                // Raise the original exception
                throw err;
            }
        }
        for (const targetId of model.targetIds) {
            const response = await service
                .attachPolicy({
                    PolicyId: model.resourceId,
                    TargetId: targetId,
                })
                .promise();
            args.logger.log({ action, message: 'target ID attachment', targetId, response });
        }

        return Promise.resolve(model);
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     */
    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'Organizations', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations, model: ResourceModel): Promise<ResourceModel> {
        const policyId = model.resourceId;
        if (!model.policyDocument && !model.content) {
            throw new exceptions.InvalidRequest('Either PolicyDocument or Content must be specified.');
        }
        if (!!model.policyDocument && !!model.content) {
            throw new exceptions.InvalidRequest('Either PolicyDocument or Content must be specified.');
        }
        try {
            const response = await service
                .updatePolicy({
                    Content: model.content ?? serializeMap(model.policyDocument),
                    Description: model.description,
                    Name: model.name,
                    PolicyId: policyId,
                })
                .promise();
            args.logger.log({ action, message: 'policy updated', policyId, response });

            return Promise.resolve(model);
        } catch (err) {
            if (err?.code === 'PolicyNotFoundException') {
                args.logger.log(err);
                throw new exceptions.NotFound(this.typeName, policyId);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     */
    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'Organizations', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations, model: ResourceModel): Promise<null> {
        const policyId = model.resourceId;

        for (const targetId of model.targetIds) {
            try {
                const response = await service
                    .detachPolicy({
                        PolicyId: policyId,
                        TargetId: targetId,
                    })
                    .promise();
                args.logger.log({ action, message: 'policy detached', policyId, targetId, response });
            } catch (err) {}
        }

        try {
            const response = await service
                .deletePolicy({
                    PolicyId: policyId,
                })
                .promise();
            args.logger.log({ action, message: 'policy deleted', policyId, response });
            return Promise.resolve(null);
        } catch (err) {
            if (err?.code === 'PolicyNotFoundException') {
                args.logger.log(err);
                throw new exceptions.NotFound(this.typeName, policyId);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     */
    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'Organizations', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations, model: ResourceModel): Promise<ResourceModel> {
        try {
            const policyTargets = await this.listPolicyTargets(service, args.logger, model.resourceId);
            const policyIds = policyTargets.map((target) => target.TargetId);
            model.targetIds = policyIds;
            const response = await service
                .describePolicy({
                    PolicyId: model.resourceId,
                })
                .promise();
            args.logger.log({ action, message: 'policy retrieved', policyId: model.resourceId, response });
            model.content = response.Policy.Content;
            // Service returns null even if original description was empty
            model.description = response.Policy.PolicySummary.Description ?? '';
            model.name = response.Policy.PolicySummary.Name;
            return Promise.resolve(model);
        } catch (err) {
            if (err?.code === 'PolicyNotFoundException') {
                args.logger.log(err);
                throw new exceptions.NotFound(this.typeName, model.resourceId);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }
}

const serializeMap = (map: any) => {
    const obj = Array.from(map).reduce((obj: Record<string, any>, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});

    return JSON.stringify(obj);
};

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
