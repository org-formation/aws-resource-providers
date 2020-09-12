import { ServiceQuotas } from 'aws-sdk';
import { BaseModel } from 'cfn-rpdk';
import { RequestServiceQuotaIncreaseRequest } from 'aws-sdk/clients/servicequotas';

export type QuotaID = { QuotaCode: string; ServiceCode: string };

export const UpsertQuotas = async (service: ServiceQuotas, previous: BaseModel, desired: BaseModel, quotaCodeForPropertyName: Record<string, QuotaID>, logger: Console) => {
    for (const [key, val] of Object.entries(desired)) {
        const prevVal = (previous as any)[key];
        logger.info({ key, val, prevVal, valType: typeof val });

        const quota = quotaCodeForPropertyName[key];
        if (!quota) continue;
        if (prevVal !== val) {
            if (prevVal && prevVal > val) {
                throw new Error(`Decrease of limit failed because desired value ${val} is lower than previous value ${prevVal}`);
            }

            try {
                const history = await service.listRequestedServiceQuotaChangeHistoryByQuota(quota).promise();
                logger.info({ method: 'get history', history });
                if (history.RequestedQuotas && history.RequestedQuotas.length > 0) {
                    const lastRequest = history.RequestedQuotas.find((x) => x.Status === 'CASE_OPENED' || x.Status === 'PENDING');
                    if (lastRequest && lastRequest.DesiredValue > val) {
                        throw new Error(`Decrease of limit failed because desired value ${val} is lower than last requested value ${lastRequest.DesiredValue}`);
                    } else if (lastRequest && lastRequest.DesiredValue == val) {
                        logger.info(`skipping update because desired value ${val} is equal to last requested value ${lastRequest.DesiredValue}`);
                        return;
                    }
                }
            } catch (err) {
                if (err && err.code === 'NoSuchResourceException') {
                    //continue
                } else {
                    throw err;
                }
            }

            try {
                const quotaResponse = await service.getServiceQuota(quota).promise();
                logger.info({ method: 'get quota', quotaResponse });
                if (quotaResponse.Quota && quotaResponse.Quota.Value > val) {
                    throw new Error(`Decrease of limit failed because desired value ${val} is lower than current quota value ${quotaResponse.Quota.Value}`);
                } else if (quotaResponse.Quota && quotaResponse.Quota.Value == val) {
                    logger.info(`skipping update because desired value ${val} is equal to current quota value ${quotaResponse.Quota.Value}`);
                    return;
                }
            } catch (err) {
                if (err && err.code === 'NoSuchResourceException') {
                    const defaultQuota = await service.getAWSDefaultServiceQuota(quota).promise();
                    if (defaultQuota.Quota && defaultQuota.Quota.Value > val) {
                        throw new Error(`Decrease of limit failed because desired value ${val} is lower than AWS default quota value ${defaultQuota.Quota.Value}`);
                    } else if (defaultQuota.Quota && defaultQuota.Quota.Value == val) {
                        logger.info(`skipping update because desired value ${val} is equal to AWS default quota value ${defaultQuota.Quota.Value}`);
                        return;
                    }
                } else {
                    throw err;
                }
            }

            const valAsNumber = 0 + (new Number(val) as any);
            const increaseRequest: RequestServiceQuotaIncreaseRequest = {
                ...quota,
                DesiredValue: valAsNumber,
            };
            logger.info({
                method: 'requesting service quota increase',
                request: increaseRequest,
            });
            try {
                const response = await service.requestServiceQuotaIncrease(increaseRequest).promise();
                logger.info(response);
            } catch (err) {
                throw err;
            }
        }
    }
};
