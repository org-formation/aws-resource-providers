import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';
import IAM from 'aws-sdk/clients/iam';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { AddClientIDToOpenIDConnectProviderRequest, RemoveClientIDFromOpenIDConnectProviderRequest, UpdateOpenIDConnectProviderThumbprintRequest } from 'aws-sdk/clients/iam';

export class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const response = await service
            .createOpenIDConnectProvider({
                ClientIDList: model.clientIdList,
                ThumbprintList: model.thumbprintList,
                Url: model.url,
            })
            .promise();

        model.arn = response.OpenIDConnectProviderArn;
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const previousModel = args.request.previousResourceState;

        if (previousModel.url !== model.url) {
            throw new exceptions.InvalidRequest(`Changing the url of an oidc provider is not supported.`);
        }

        const prevClientIds = previousModel.clientIdList ?? [];
        const clientIds = model.clientIdList ?? [];
        const clientIdsNeedToAdd = clientIds.filter((x) => !prevClientIds.includes(x));
        const clientIdsNeedToRemove = prevClientIds.filter((x) => !clientIds.includes(x));

        for (const clientIdToRemove of clientIdsNeedToRemove) {
            const request: RemoveClientIDFromOpenIDConnectProviderRequest = {
                OpenIDConnectProviderArn: model.arn,
                ClientID: clientIdToRemove,
            };
            console.info({ message: 'removing client id', ...request });
            await service.removeClientIDFromOpenIDConnectProvider(request).promise();
        }

        for (const clientIdToAdd of clientIdsNeedToAdd) {
            const request: AddClientIDToOpenIDConnectProviderRequest = {
                OpenIDConnectProviderArn: model.arn,
                ClientID: clientIdToAdd,
            };
            console.info({ message: 'adding client id', ...request });
            await service.addClientIDToOpenIDConnectProvider(request).promise();
        }

        const updateThumbPrintsRequest: UpdateOpenIDConnectProviderThumbprintRequest = {
            ThumbprintList: model.thumbprintList,
            OpenIDConnectProviderArn: model.arn,
        };
        console.info({ message: 'updating thumb prints', ...updateThumbPrintsRequest, previous: previousModel.thumbprintList });
        await service.updateOpenIDConnectProviderThumbprint(updateThumbPrintsRequest).promise();

        return Promise.resolve(model);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const response = await service.getOpenIDConnectProvider({ OpenIDConnectProviderArn: model.arn }).promise();
        const read = new ResourceModel({
            Url: response.Url,
            ClientIDList: response.ClientIDList,
            ThumbprintList: response.ThumbprintList,
            Arn: model.arn,
        });
        return Promise.resolve(read);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<null> {
        try {
            await service.deleteOpenIDConnectProvider({ OpenIDConnectProviderArn: model.arn }).promise();
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
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
