import { SSM } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, handlerEvent, Logger } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    private async upsertSSMPublicSharingBlock(action: Action, service: SSM, logger: Logger, model: ResourceModel): Promise<ResourceModel> {
        const request: SSM.UpdateServiceSettingRequest = {
            SettingId: '/ssm/documents/console/public-sharing-permission',
            SettingValue: model.blockPublicSharing ? 'Disable' : 'Enable',
        };

        logger.log({
            action,
            message: 'before invoke updateServiceSetting',
            request,
        });
        const response = await service.updateServiceSetting(request).promise();
        logger.log({
            action,
            message: 'after invoke updateServiceSetting',
            response,
        });

        logger.log({ action, message: 'done', model });
        return model;
    }
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'SSM', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SSM, model: ResourceModel): Promise<ResourceModel> {
        const accountId = args.request.awsAccountId;
        model.resourceId = `${accountId}/${args.request.region}`;
        return this.upsertSSMPublicSharingBlock(action, service, args.logger, model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'SSM', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SSM, model: ResourceModel): Promise<ResourceModel> {
        return this.upsertSSMPublicSharingBlock(action, service, args.logger, model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'SSM', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SSM): Promise<null> {
        const model = new ResourceModel();
        model.blockPublicSharing = false;
        this.upsertSSMPublicSharingBlock(action, service, args.logger, model);

        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'SSM', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: SSM): Promise<ResourceModel> {
        const accountId = args.request.awsAccountId;

        const request: SSM.GetServiceSettingRequest = {
            SettingId: '/ssm/documents/console/public-sharing-permission',
        };

        args.logger.log({
            action,
            message: 'before invoke getServiceSetting',
            request,
        });
        try {
            const response = await service.getServiceSetting(request).promise();
            args.logger.log({
                action,
                message: 'after invoke getServiceSetting',
                response,
            });

            const blockPublicSharing = response.ServiceSetting.SettingValue === 'Disabled' ? true : false;

            const result: ResourceModel = new ResourceModel();
            result.blockPublicSharing = blockPublicSharing;
            result.resourceId = accountId;

            args.logger.log({ action, message: 'done', result });

            return Promise.resolve(result);
        } catch (err) {
            // Raise the original exception
            throw err;
        }
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
