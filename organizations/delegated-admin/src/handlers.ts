import { Organizations } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, handlerEvent, exceptions } from 'cfn-rpdk';

import { ResourceModel } from './models';
import { DeregisterDelegatedAdministratorRequest, RegisterDelegatedAdministratorRequest } from 'aws-sdk/clients/organizations';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

interface CallbackContext extends Record<string, any> {}

class Resource extends BaseResource<ResourceModel> {

    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'Organizations', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations): Promise<ResourceModel> {
        const { desiredResourceState, awsAccountId } = args.request;
        const model = new ResourceModel(desiredResourceState);

        const request: RegisterDelegatedAdministratorRequest = {
            ServicePrincipal : model.servicePrincipal,
            AccountId: model.accountId
        };
        await service.registerDelegatedAdministrator(request).promise();

        model.arn = `arn:community:organizations::${awsAccountId}:delegated-admin/${model.accountId}-${model.servicePrincipal}`;
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'Organizations'})
    public async update(): Promise<ResourceModel> {
        throw new exceptions.InvalidRequest("Type doesn't support updates.")
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'Organizations'})
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations): Promise<null> {
        const { desiredResourceState } = args.request;

        const request: DeregisterDelegatedAdministratorRequest = {
            ServicePrincipal: desiredResourceState.servicePrincipal,
            AccountId: desiredResourceState.accountId
        }

        await service.deregisterDelegatedAdministrator(request).promise();

        return null;
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
