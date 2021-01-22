import { S3Control } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from 'cfn-rpdk';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    private async upsertAccountPublicAccessBlock(action: Action, service: S3Control, logger: Logger, model: ResourceModel, accountId: string): Promise<ResourceModel> {
        const request: S3Control.PutPublicAccessBlockRequest = {
            AccountId: accountId,
            PublicAccessBlockConfiguration: {
                IgnorePublicAcls : model.ignorePublicAcls,
                BlockPublicAcls: model.blockPublicAcls,
                BlockPublicPolicy: model.blockPublicPolicy,
                RestrictPublicBuckets: model.restrictPublicBuckets
            }
        };

        logger.log({
            action,
            message: 'before invoke putPublicAccessBlock',
            request,
        });
        const response = await service.putPublicAccessBlock(request).promise();
        logger.log({
            action,
            message: 'after invoke putPublicAccessBlock',
            response,
        });

        logger.log({ action, message: 'done', model });
        return model;
    }

    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'S3Control', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: S3Control, model: ResourceModel): Promise<ResourceModel> {
        const accountId = args.request.awsAccountId;
        model.resourceId = accountId;
        return this.upsertAccountPublicAccessBlock(action, service, args.logger, model, accountId);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'S3Control', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: S3Control, model: ResourceModel): Promise<ResourceModel> {
        const accountId = args.request.awsAccountId;
        return this.upsertAccountPublicAccessBlock(action, service, args.logger, model, accountId);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'S3Control', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: S3Control): Promise<null> {
        const request: S3Control.DeletePublicAccessBlockRequest = {
            AccountId: args.request.awsAccountId,
        };

        args.logger.log({
            action,
            message: 'before invoke deletePublicAccessBlock',
            request,
        });
        const response = await service.deletePublicAccessBlock(request).promise();
        args.logger.log({
            action,
            message: 'after invoke deletePublicAccessBlock',
            response,
        });

        args.logger.log({ action, message: 'done' });

        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'S3Control', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: S3Control): Promise<ResourceModel> {
        const accountId = args.request.awsAccountId;

        const request: S3Control.GetPublicAccessBlockRequest = {
            AccountId: accountId,
        };

        args.logger.log({
            action,
            message: 'before invoke getPublicAccessBlock',
            request,
        });
        try {
            const response = await service.getPublicAccessBlock(request).promise();
            args.logger.log({
                action,
                message: 'after invoke getPublicAccessBlock',
                response,
            });

            const publicAccessBlock = response.PublicAccessBlockConfiguration;

            const result = ResourceModel.deserialize(publicAccessBlock);
            result.resourceId = accountId;

            args.logger.log({ action, message: 'done', result });

            return Promise.resolve(result);
        } catch (err) {
            if (err && err.code === 'NoSuchPublicAccessBlockConfiguration') {
                throw new exceptions.NotFound(ResourceModel.TYPE_NAME, request.AccountId);
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
