import { Action, BaseResource, exceptions, handlerEvent, Logger } from 'cfn-rpdk';
import { ResourceModel } from './models';
import { IAM, ServiceQuotas } from 'aws-sdk';
import { commonAws, UpsertQuotas, QuotaID, HandlerArgs } from 'aws-resource-providers-common';
import { url } from 'inspector';


// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

interface CallbackContext extends Record<string, any> {}

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {

        const response = await service.createOpenIDConnectProvider( {
            ClientIDList: model.clientIDList,
            ThumbprintList: model.thumbprintList,
            Url: model.url
        }).promise();

        model.arn = response.OpenIDConnectProviderArn;
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const previousModel = args.request.previousResourceState;

        if (previousModel.url !== model.url) {
            throw new exceptions.InvalidRequest(`Changing the url of an oidc provider is not supported.`)
        }

        const prevClientIds = (previousModel.clientIDList ?? []).sort();
        const clientIds = (model.clientIDList ?? []).sort();

        if (prevClientIds.length !== clientIds.length) {
            throw new exceptions.InvalidRequest(`Changing the client ids of an oidc provider is not supported.`)
        }

        for(const index in clientIds) {
            if (prevClientIds[index] !== clientIds[index]) {
                throw new exceptions.InvalidRequest(`Changing the client ids of an oidc provider is not supported.`)
            }
        }

        await service.updateOpenIDConnectProviderThumbprint( {
            ThumbprintList: model.thumbprintList,
            OpenIDConnectProviderArn: model.arn
        }).promise();

        return Promise.resolve(model);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {

        const response = await service.getOpenIDConnectProvider({OpenIDConnectProviderArn: model.arn}).promise();
        const read = new ResourceModel({
            Url:  response.Url,
            ClientIDList: response.ClientIDList,
            ThumbprintList: response.ThumbprintList,
            Arn: model.arn
        })
        return Promise.resolve(read);
    }


    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'IAM', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<null> {

        await service.deleteOpenIDConnectProvider({OpenIDConnectProviderArn: model.arn}).promise();
        return Promise.resolve(null);
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
