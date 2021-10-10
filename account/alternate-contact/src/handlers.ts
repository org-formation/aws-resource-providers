import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { commonAws } from 'aws-resource-providers-common';
import { AWSError } from 'aws-sdk';
import { mainModule } from 'process';
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
        try {
            const _ = await service
                .deleteAlternateContact({
                    AlternateContactType: model.alternateContactType,
                    AccountId: model.accountId,
                })
                .promise();

            return Promise.resolve(model);
        } catch (err) {
            const error = err as AWSError;
            if (error.statusCode === 404) {
                throw new exceptions.NotFound(ResourceModel.TYPE_NAME, model.alternateContactType);
            }
            throw err;
        }
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
