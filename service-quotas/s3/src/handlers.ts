import { Action, BaseResource, exceptions, handlerEvent, Logger } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
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
    @commonAws({ serviceName: 'ServiceQuotas', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: ServiceQuotas, model: ResourceModel): Promise<ResourceModel> {
        const accountId = args.request.awsAccountId;
        model.resourceId = accountId;

        await UpsertQuotas(service, new ResourceModel(), model, quotaCodeForPropertyName, LOGGER);

        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'ServiceQuotas', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: ServiceQuotas, model: ResourceModel): Promise<ResourceModel> {
        const previousModel = args.request.previousResourceState;

        await UpsertQuotas(service, previousModel, model, quotaCodeForPropertyName, LOGGER);

        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'ServiceQuotas', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: ServiceQuotas, model: ResourceModel): Promise<null> {
        args.logger.log({ method: 'delete (no-op)', model });
        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'ServiceQuotas', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: ServiceQuotas, model: ResourceModel): Promise<ResourceModel> {
        const identifier = args.request.logicalResourceIdentifier || model.resourceId!;
        const updatedModel = await this.updateModelWithValuesFromQuotas(service, identifier, model, quotaCodeForPropertyName, args.logger);
        return updatedModel;
    }

    private async updateModelWithValuesFromQuotas(
        service: ServiceQuotas,
        identifier: string,
        model: ResourceModel,
        quotaCodeForPropertyName: Record<string, QuotaID>,
        logger: Logger
    ): Promise<ResourceModel> {
        const obj = model as any;
        for (const [propertyName, quota] of Object.entries(quotaCodeForPropertyName)) {
            try {
                obj[propertyName] = await this.getQuotaValue(service, quota, logger);
            } catch (err) {
                if (err && err.code === 'NoSuchResourceException') {
                    throw new exceptions.NotFound(ResourceModel.TYPE_NAME, identifier);
                } else {
                    throw err;
                }
            }
        }
        return model;
    }

    private async getQuotaValue(service: ServiceQuotas, quota: QuotaID, logger: Logger): Promise<number> {
        logger.log({ method: 'getting quota value', quota });
        logger.log({ method: 'before get history', quota });

        try {
            const history = await service.listRequestedServiceQuotaChangeHistoryByQuota(quota).promise();
            logger.log({ method: 'after get history', quota, history });

            if (history.RequestedQuotas && history.RequestedQuotas.length > 0) {
                const lastRequest = history.RequestedQuotas.find((x) => x.Status === 'CASE_OPENED' || x.Status === 'PENDING');
                return lastRequest.DesiredValue;
            }
        } catch (err) {
            if (err && err.code === 'NoSuchResourceException') {
                //continue, doesn't necessarily mean the resource was not deployed
                // deploying the resource with its default value will not create any request.
            } else {
                throw err;
            }
        }

        try {
            logger.log({ method: 'before get quota', quota });
            const quotaResponse = await service.getServiceQuota(quota).promise();
            logger.log({ method: 'after get quota', quota, quotaResponse });

            if (quotaResponse.Quota && quotaResponse.Quota.Value !== undefined) {
                return quotaResponse.Quota.Value;
            }
        } catch (err) {
            if (err && err.code === 'NoSuchResourceException') {
                //continue, doesn't necessarily mean the resource was not deployed
                // deploying the resource with its default value will not create any request.
            } else {
                throw err;
            }
        }

        const defaultQuota = await service.getAWSDefaultServiceQuota(quota).promise();

        return defaultQuota.Quota.Value;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
