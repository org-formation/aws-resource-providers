import { Action, BaseResource, exceptions, handlerEvent, OperationStatus, Optional, ProgressEvent, ResourceHandlerRequest, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';
import { IAM } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { CreateSAMLProviderRequest, UpdateSAMLProviderRequest, DeleteSAMLProviderRequest } from 'aws-sdk/clients/iam';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

type CallbackContext = Record<string, any>;

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const response = await service
            .createSAMLProvider({
                Name: model.name,
                SAMLMetadataDocument: model.metadataDocument,
            })
            .promise();

        model.arn = response.SAMLProviderArn;
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const previousModel = args.request.previousResourceState;

        if (previousModel.name !== model.name) {
            throw new exceptions.InvalidRequest(`Changing the name of a saml provider is not supported.`);
        }

        await service
            .updateSAMLProvider({
                SAMLProviderArn: model.arn,
                SAMLMetadataDocument: model.metadataDocument,
            })
            .promise();

        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<null> {
        try {
            await service.deleteSAMLProvider({ SAMLProviderArn: model.arn }).promise();
        } catch (err) {
            if (err && err.code === 'NoSuchEntity') {
                throw new exceptions.NotFound(ResourceModel.TYPE_NAME, model.arn || args.request.logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        }
        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const response = await service.getSAMLProvider({ SAMLProviderArn: model.arn }).promise();
        const read = new ResourceModel({
            Name: model.name,
            MetadataDocument: response.SAMLMetadataDocument,
            Arn: model.arn,
        });
        return Promise.resolve(read);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
