import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { CloudFormation } from 'aws-sdk';
import { ResourceModel } from './models';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: CloudFormation, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: CloudFormation, model: ResourceModel): Promise<ResourceModel> {
        const response = await service
            .setTypeConfiguration({
                Type: model.type_,
                TypeName: model.typeName,
                Configuration: model.configuration,
                ConfigurationAlias: model.configurationAlias,
            })
            .promise();
        model.resourceId = response.ConfigurationArn;
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: CloudFormation, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CloudFormation, model: ResourceModel): Promise<ResourceModel> {
        await service
            .setTypeConfiguration({
                Type: model.type_,
                TypeName: model.typeName,
                Configuration: model.configuration,
                ConfigurationAlias: model.configurationAlias,
            })
            .promise();
        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: CloudFormation, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: CloudFormation, model: ResourceModel): Promise<null> {
        return Promise.resolve(null);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
