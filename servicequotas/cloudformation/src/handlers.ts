import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    HandlerErrorCode,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from 'cfn-rpdk';
import { ResourceModel } from './models';
import { ServiceQuotas } from 'aws-sdk'
import { RequestServiceQuotaIncreaseRequest, GetServiceQuotaRequest } from 'aws-sdk/clients/servicequotas';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

const quotaCodeForPropertyName: Record<string, string> = {
    stacks: 'L-0485CB21',
    resourceTypes: 'L-9DE8E4FB',
    versionsPerResourceType: 'L-EA1018E8',
    stackSetsPerAdministratorAccount: 'L-EC62D81A',
    stackInstancesPerStackSet: 'L-C8225BA5',
}

const UpsertCloudFormationQuotas = async (service: ServiceQuotas, previous: ResourceModel, desired: ResourceModel) => {
    for (const [key, val] of Object.entries(desired)) {
        const prevVal = (previous as any)[key];
        LOGGER.info({ key, val, prevVal, valType: (typeof val) });

        const quotaCode = quotaCodeForPropertyName[key];
        if (!quotaCode) continue;
        if (prevVal !== val) {
            if (prevVal && prevVal > val) {
                throw new Error(`Decrease of limit failed because desired value ${val} is lower than previous value ${prevVal}`);
            }

            const quota = { QuotaCode: quotaCode, ServiceCode: 'cloudformation' };

            try {
                const history = await service.listRequestedServiceQuotaChangeHistoryByQuota(quota).promise();
                LOGGER.info({ method: 'get history', history });
                if (history.RequestedQuotas && history.RequestedQuotas.length > 0) {
                    const lastRequest = history.RequestedQuotas.find(x => x.Status === 'CASE_OPENED' || x.Status === 'PENDING');
                    if (lastRequest && lastRequest.DesiredValue > val) {
                        throw new Error(`Decrease of limit failed because desired value ${val} is lower than last requested value ${lastRequest.DesiredValue}`);
                    } else if (lastRequest && lastRequest.DesiredValue == val) {
                        LOGGER.info(`skipping update because desired value ${val} is equal to last requested value ${lastRequest.DesiredValue}`);
                    }
                }
            } catch (err) {
                if (err.code !== 'NoSuchResourceException') {
                    throw err;
                }
            }

            const quotaResponse = await service.getServiceQuota(quota).promise();
            LOGGER.info({ method: 'get quota', quotaResponse });
            if (quotaResponse.Quota && quotaResponse.Quota.Value > val) {
                throw new Error(`Decrease of limit failed because desired value ${val} is lower than current quota value ${quotaResponse.Quota.Value}`);
            } else if (quotaResponse.Quota && quotaResponse.Quota.Value == val) {
                LOGGER.info(`skipping update because desired value ${val} is equal to current quota value ${quotaResponse.Quota.Value}`);
            }

            const valAsNumber = 0 + (new Number(val) as any);
            const increaseRequest: RequestServiceQuotaIncreaseRequest = { ...quota, DesiredValue: valAsNumber };
            LOGGER.info({ method: 'requesting service quota increase', request: increaseRequest });
            try {
                const response = await service.requestServiceQuotaIncrease(increaseRequest).promise();
                LOGGER.info(response);
            } catch (err) {
                throw err;
            }
        }
    }
}


interface CallbackContext extends Record<string, any> { }

class Resource extends BaseResource<ResourceModel> {

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     */
    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
    ): Promise<ProgressEvent> {
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);

        LOGGER.info({ handler: 'create', request, callbackContext, env: process.env });
        model.resourceId = 'cloudformation-quotas'; // there can only be one

        try {
            if (session instanceof SessionProxy) {
                const serviceQuotas = session.client("ServiceQuotas") as ServiceQuotas;
                await UpsertCloudFormationQuotas(serviceQuotas, new ResourceModel(), model);
            }
            progress.status = OperationStatus.Success;
        } catch (err) {
            LOGGER.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
        }
        return progress;
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     */
    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
    ): Promise<ProgressEvent> {
        const desired: ResourceModel = request.desiredResourceState;
        const previous: ResourceModel = request.previousResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(desired);

        LOGGER.info({ handler: 'update', request, callbackContext, env: process.env });

        try {
            if (session instanceof SessionProxy) {
                const serviceQuotas = session.client("ServiceQuotas") as ServiceQuotas;
                await UpsertCloudFormationQuotas(serviceQuotas, previous, desired);
            }
            progress.status = OperationStatus.Success;
        } catch (err) {
            LOGGER.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
        }
        return progress;
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     */
    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
    ): Promise<ProgressEvent> {
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>();
        // TODO: put code here
        progress.status = OperationStatus.Success;
        return progress;
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     */
    @handlerEvent(Action.Read)
    public async read(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
    ): Promise<ProgressEvent> {
        const model: ResourceModel = request.desiredResourceState;
        // TODO: put code here
        const progress = ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
        return progress;
    }

    /**
     * CloudFormation invokes this handler when summary information about multiple
     * resources of this resource provider is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     */
    @handlerEvent(Action.List)
    public async list(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
    ): Promise<ProgressEvent> {
        const model: ResourceModel = request.desiredResourceState;
        // TODO: put code here
        const progress = ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
            .status(OperationStatus.Success)
            .resourceModels([model])
            .build();
        return progress;
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
