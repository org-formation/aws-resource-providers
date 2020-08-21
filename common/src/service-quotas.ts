
import { ServiceQuotas } from 'aws-sdk'
import { BaseModel } from 'cfn-rpdk';
import { RequestServiceQuotaIncreaseRequest, GetServiceQuotaRequest } from 'aws-sdk/clients/servicequotas';

export type QuotaID = {QuotaCode: string, ServiceCode: string};

const quotaCodeForPropertyName: Record<string, QuotaID> = {
    stacks: {QuotaCode: 'L-0485CB21', ServiceCode: 'cloudformation'},
    resourceTypes: {QuotaCode: 'L-9DE8E4FB',ServiceCode: 'cloudformation'},
    versionsPerResourceType: {QuotaCode: 'L-EA1018E8',ServiceCode: 'cloudformation'},
    stackSetsPerAdministratorAccount: {QuotaCode: 'L-EC62D81A',ServiceCode: 'cloudformation'},
    stackInstancesPerStackSet: {QuotaCode: 'L-C8225BA5', ServiceCode: 'cloudformation'},
}

export const UpsertQuotas = async (service: ServiceQuotas, previous: BaseModel, desired: BaseModel, logger: Console) => {
    for (const [key, val] of Object.entries(desired)) {
        const prevVal = (previous as any)[key];
        logger.info({ key, val, prevVal, valType: (typeof val) });

        const quota = quotaCodeForPropertyName[key];
        if (!quota) continue;
        if (prevVal !== val) {
            if (prevVal && prevVal > val) {
                throw new Error(`Decrease of limit failed because desired value ${val} is lower than previous value ${prevVal}`);
            }

            const history = await service.listRequestedServiceQuotaChangeHistoryByQuota(quota).promise();
            logger.info({ method: 'get history', history });
            if (history.RequestedQuotas && history.RequestedQuotas.length > 0) {
                const lastRequest = history.RequestedQuotas.find(x => x.Status === 'CASE_OPENED' || x.Status === 'PENDING');
                if (lastRequest && lastRequest.DesiredValue > val) {
                    throw new Error(`Decrease of limit failed because desired value ${val} is lower than last requested value ${lastRequest.DesiredValue}`);
                } else if (lastRequest && lastRequest.DesiredValue == val) {
                    logger.info(`skipping update because desired value ${val} is equal to last requested value ${lastRequest.DesiredValue}`);
                }
            }

            const quotaResponse = await service.getServiceQuota(quota).promise();
            logger.info({ method: 'get quota', quotaResponse });
            if (quotaResponse.Quota && quotaResponse.Quota.Value > val) {
                throw new Error(`Decrease of limit failed because desired value ${val} is lower than current quota value ${quotaResponse.Quota.Value}`);
            } else if (quotaResponse.Quota && quotaResponse.Quota.Value == val) {
                logger.info(`skipping update because desired value ${val} is equal to current quota value ${quotaResponse.Quota.Value}`);
            }

            const valAsNumber = 0 + (new Number(val) as any);
            const increaseRequest: RequestServiceQuotaIncreaseRequest = { ...quota, DesiredValue: valAsNumber };
            logger.info({ method: 'requesting service quota increase', request: increaseRequest });
            try {
                const response = await service.requestServiceQuotaIncrease(increaseRequest).promise();
                logger.info(response);
            } catch (err) {
                throw err;
            }
        }
    }
}
