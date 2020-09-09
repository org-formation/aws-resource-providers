import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel } from './models';
import { ServiceQuotas } from 'aws-sdk';
import { commonAws, UpsertQuotas, QuotaID, HandlerArgs } from 'aws-resource-providers-common';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

const quotaCodeForPropertyName: Record<string, QuotaID> = {
    buckets: { QuotaCode: 'L-DC2B2D3D', ServiceCode: 's3' },
};

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'ServiceQuotas' })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: ServiceQuotas): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        const accountId = args.request.awsAccountId;
        model.resourceId = accountId;

        await UpsertQuotas(service, new ResourceModel(), model, quotaCodeForPropertyName, LOGGER);

        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'ServiceQuotas' })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: ServiceQuotas): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        const previousModel = args.request.previousResourceState;

        await UpsertQuotas(service, previousModel, model, quotaCodeForPropertyName, LOGGER);

        return model;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
