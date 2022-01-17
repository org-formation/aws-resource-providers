import { Action, BaseResource, handlerEvent } from 'cfn-rpdk';
import { commonAws } from 'aws-resource-providers-common';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'Account', debug: true })
    public async create(action: Action, args: never, service: AWS.Account, model: ResourceModel): Promise<ResourceModel> {
        const _ = await service
            .putAlternateContact({
                AlternateContactType: model.alternateContactType,
                AccountId: model.accountId,
                Name: model.name,
                PhoneNumber: model.phoneNumber,
                Title: model.title,
                EmailAddress: model.emailAddress,
            })
            .promise();

        return Promise.resolve(model);
    }
    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'Account', debug: true })
    public async update(action: Action, args: never, service: AWS.Account, model: ResourceModel): Promise<ResourceModel> {
        const _ = await service
            .putAlternateContact({
                AlternateContactType: model.alternateContactType,
                AccountId: model.accountId,
                Name: model.name,
                PhoneNumber: model.phoneNumber,
                Title: model.title,
                EmailAddress: model.emailAddress,
            })
            .promise();

        return Promise.resolve(model);
    }
    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'Account', debug: true })
    public async delete(action: Action, args: never, service: AWS.Account, model: ResourceModel): Promise<ResourceModel> {
        const _ = await service
            .deleteAlternateContact({
                AlternateContactType: model.alternateContactType,
                AccountId: model.accountId,
            })
            .promise();

        return Promise.resolve(model);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
