import { Action, BaseResource, handlerEvent } from 'cfn-rpdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { ResourceModel } from './models';
import { EC2 } from 'aws-sdk';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        model.resourceId = 'region-defaults'; // there can only be one

        if (model.defaultEbsEncryptionKeyId !== undefined || model.enableEbsEncryptionByDefault !== undefined) {
            if (model.enableEbsEncryptionByDefault === true) {
                await service.enableEbsEncryptionByDefault().promise();
            } else if (model.enableEbsEncryptionByDefault === false) {
                await service.disableEbsEncryptionByDefault().promise();
            }

            if (typeof model.defaultEbsEncryptionKeyId === 'string') {
                await service
                    .modifyEbsDefaultKmsKeyId({
                        KmsKeyId: model.defaultEbsEncryptionKeyId,
                    })
                    .promise();
            }
        }
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        const prevModel = new ResourceModel(args.request.previousResourceState);

        if (model.enableEbsEncryptionByDefault !== prevModel.enableEbsEncryptionByDefault) {
            if (model.enableEbsEncryptionByDefault === true) {
                await service.enableEbsEncryptionByDefault().promise();
            } else {
                await service.disableEbsEncryptionByDefault().promise();
            }
        }

        if (model.defaultEbsEncryptionKeyId !== prevModel.defaultEbsEncryptionKeyId) {
            if (typeof model.defaultEbsEncryptionKeyId === 'string') {
                await service
                    .modifyEbsDefaultKmsKeyId({
                        KmsKeyId: model.defaultEbsEncryptionKeyId,
                    })
                    .promise();
            } else {
                await service.resetEbsDefaultKmsKeyId().promise();
            }
        }
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<null> {
        if (model.enableEbsEncryptionByDefault === true) {
            await service.disableEbsEncryptionByDefault().promise();
        }

        if (typeof model.defaultEbsEncryptionKeyId === 'string') {
            await service.resetEbsDefaultKmsKeyId().promise();
        }
        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        return Promise.resolve(model);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
