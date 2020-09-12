import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel } from './models';
import { ServiceQuotas } from 'aws-sdk';
import {
    commonAws,
    UpsertQuotas,
    QuotaID,
    HandlerArgs,
} from 'aws-resource-providers-common';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

const quotaCodeForPropertyName: Record<string, QuotaID> = {
    buckets: { QuotaCode: 'L-DC2B2D3D', ServiceCode: 's3' },
};

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'ServiceQuotas' })
    public async create(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: ServiceQuotas
    ): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        const accountId = args.request.awsAccountId;
        model.resourceId = accountId;

        await UpsertQuotas(
            service,
            new ResourceModel(),
            model,
            quotaCodeForPropertyName,
            LOGGER
        );

        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'ServiceQuotas' })
    public async update(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: ServiceQuotas
    ): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        const previousModel = args.request.previousResourceState;

        await UpsertQuotas(
            service,
            previousModel,
            model,
            quotaCodeForPropertyName,
            LOGGER
        );

        return model;
    }

    @handlerEvent(Action.Delete)
    public async delete(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: ServiceQuotas
    ): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        LOGGER.info({ method: 'delete (no-op)', model });
        return model;
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'ServiceQuotas' })
    public async read(
        action: Action,
        args: HandlerArgs<ResourceModel>,
        service: ServiceQuotas
    ): Promise<ResourceModel> {
        const model = args.request.desiredResourceState;
        const identifier = args.request.logicalResourceIdentifier || model.resourceId!;
        const updatedModel = await this.updateModelWithValuesFromQuotas(
            service,
            identifier,
            model,
            quotaCodeForPropertyName,
            LOGGER
        );
        return updatedModel;
    }

    private async updateModelWithValuesFromQuotas(
        service: ServiceQuotas,
        identifier: string,
        model: ResourceModel,
        quotaCodeForPropertyName: Record<string, QuotaID>,
        logger: Console
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

    private async getQuotaValue(
        service: ServiceQuotas,
        quota: QuotaID,
        logger: Console
    ): Promise<number> {
        logger.info({ method: 'getting quota value', quota });
        logger.info({ method: 'before get history', quota });

        try {
            const history = await service
                .listRequestedServiceQuotaChangeHistoryByQuota(quota)
                .promise();
            logger.info({ method: 'after get history', quota, history });

            if (history.RequestedQuotas && history.RequestedQuotas.length > 0) {
                const lastRequest = history.RequestedQuotas.find(
                    (x) => x.Status === 'CASE_OPENED' || x.Status === 'PENDING'
                );
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
            logger.info({ method: 'before get quota', quota });
            const quotaResponse = await service.getServiceQuota(quota).promise();
            logger.info({ method: 'after get quota', quota, quotaResponse });

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
