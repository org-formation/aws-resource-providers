import { S3Control } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions } from 'cfn-rpdk';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    private async upsertAccountPublicAccessBlock(
        action: Action,
        service: S3Control,
        model: ResourceModel,
        accountId: string
    ): Promise<ResourceModel> {
        const request: S3Control.PutPublicAccessBlockRequest = {
            AccountId: accountId,
            PublicAccessBlockConfiguration: model.serialize(),
        };

        console.info({
            action,
            message: 'before invoke putPublicAccessBlock',
            request,
        });
        const response = await service.putPublicAccessBlock(request).promise();
        console.info({
            action,
            message: 'after invoke putPublicAccessBlock',
            response,
        });

        const result = new ResourceModel(model);
        result.resourceId = accountId;

        console.info({ action, message: 'done', result });
        return result;
    }

    @commonAws({
        action: Action.Create,
        serviceName: 'S3Control',
        debug: true,
    })
    public async create(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: S3Control
    ): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        const accountId = args.request.awsAccountId;
        return this.upsertAccountPublicAccessBlock(action, service, model, accountId);
    }

    @commonAws({
        action: Action.Update,
        serviceName: 'S3Control',
        debug: true,
    })
    public async update(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: S3Control
    ): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        const accountId = args.request.awsAccountId;
        return this.upsertAccountPublicAccessBlock(action, service, model, accountId);
    }

    @commonAws({
        action: Action.Delete,
        serviceName: 'S3Control',
        debug: true,
    })
    public async delete(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: S3Control
    ): Promise<null> {
        const request: S3Control.DeletePublicAccessBlockRequest = {
            AccountId: args.request.awsAccountId,
        };

        console.info({
            action,
            message: 'before invoke deletePublicAccessBlock',
            request,
        });
        const response = await service.deletePublicAccessBlock(request).promise();
        console.info({
            action,
            message: 'after invoke deletePublicAccessBlock',
            response,
        });

        console.info({ action, message: 'done' });

        return Promise.resolve(null);
    }

    @commonAws({
        action: Action.Read,
        serviceName: 'S3Control',
        debug: true,
    })
    public async read(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: S3Control
    ): Promise<ResourceModel> {
        const accountId = args.request.awsAccountId;

        const request: S3Control.GetPublicAccessBlockRequest = {
            AccountId: accountId,
        };

        console.info({
            action,
            message: 'before invoke getPublicAccessBlock',
            request,
        });
        try {
            const response = await service.getPublicAccessBlock(request).promise();
            console.info({
                action,
                message: 'after invoke getPublicAccessBlock',
                response,
            });

            const publicAccessBlock = response.PublicAccessBlockConfiguration;

            const result = ResourceModel.deserialize(publicAccessBlock);
            result.resourceId = accountId;

            console.info({ action, message: 'done', result });

            return Promise.resolve(result);
        } catch (err) {
            if (err && err.code === 'NoSuchPublicAccessBlockConfiguration') {
                throw new exceptions.NotFound(
                    ResourceModel.TYPE_NAME,
                    request.AccountId
                );
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
