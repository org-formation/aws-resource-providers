import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';

import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { logicalResourceIdentifier } = args.request;

        if (model.arn) {
            throw new exceptions.InvalidRequest('Read only property [Arn] cannot be provided by the user.');
        }

        const request: SecurityHub.CreateActionTargetRequest = {
            Id: model.id,
            Name: model.name,
            Description: model.description,
        };

        try {
            args.logger.log({ action, message: 'before createActionTarget', request });
            const response = await service.createActionTarget(request).promise();
            args.logger.log({ action, message: 'after invoke createActionTarget', response });

            model.arn = response.ActionTargetArn;
            args.logger.log({ action, message: 'done', model });
            return Promise.resolve(model);
        } catch (err) {
            console.log(err);
            if (err?.code === 'ResourceConflictException') {
                throw new exceptions.AlreadyExists(this.typeName, logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { logicalResourceIdentifier, previousResourceState } = args.request;
        const { arn, id } = previousResourceState;
        if (!model.arn && !model.id) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        } else if (model.arn !== arn) {
            args.logger.log(this.typeName, `[NEW ${model.arn}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${arn}].`);
            throw new exceptions.NotUpdatable('Read only property [Arn] cannot be updated.');
        } else if (model.id !== id) {
            args.logger.log(this.typeName, `[NEW ${model.id}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${id}].`);
            throw new exceptions.NotUpdatable('Read only property [Id] cannot be updated.');
        }
        try {
            const request: SecurityHub.UpdateActionTargetRequest = {
                ActionTargetArn: model.arn,
                Name: model.name,
                Description: model.description,
            };
            args.logger.log({ action, message: 'before invoke updateActionTarget', request });
            const response = await service.updateActionTarget(request).promise();
            args.logger.log({ action, message: 'after invoke updateActionTarget', response });

            args.logger.log({ action, message: 'done', model });
            return Promise.resolve(model);
        } catch (err) {
            if (err?.code === 'ResourceNotFoundException') {
                throw new exceptions.NotFound(this.typeName, arn || logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<null> {
        const { logicalResourceIdentifier } = args.request;
        if (!model.arn) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        }

        const request: SecurityHub.DeleteActionTargetRequest = {
            ActionTargetArn: model.arn,
        };

        try {
            args.logger.log({ action, message: 'before invoke deleteActionTarget', request });
            const response = await service.deleteActionTarget(request).promise();
            args.logger.log({ action, message: 'after invoke deleteActionTarget', response });

            args.logger.log({ action, message: 'done' });
            return Promise.resolve(null);
        } catch (err) {
            if (err?.code === 'ResourceNotFoundException') {
                throw new exceptions.NotFound(this.typeName, model.arn || logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    @handlerEvent(Action.Read)
    @commonAws({ service: SecurityHub, debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { logicalResourceIdentifier } = args.request;
        if (!model.arn) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        }
        const request: SecurityHub.DescribeActionTargetsRequest = {
            ActionTargetArns: [model.arn],
            MaxResults: 1,
        };
        try {
            args.logger.log({ action, message: 'before invoke describeActionTargets', request });
            const response = await service.describeActionTargets(request).promise();
            args.logger.log({ action, message: 'after invoke describeActionTargets', response });

            const targets = response.ActionTargets;

            if (!targets.length) {
                throw new exceptions.NotFound(this.typeName, model.arn || logicalResourceIdentifier);
            }

            model.name = targets[0].Name;
            model.description = targets[0].Description;

            args.logger.log({ action, message: 'done', model });
            return Promise.resolve(model);
        } catch (err) {
            if (err?.code === 'ResourceNotFoundException') {
                throw new exceptions.NotFound(this.typeName, model.arn || logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
