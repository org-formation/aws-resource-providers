import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';
import { ServiceQuotas } from 'aws-sdk';
import { QuotaID, UpsertQuotas } from 'aws-resource-providers-common';
// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

const quotaCodeForPropertyName: Record<string, QuotaID> = {
    roles: { QuotaCode: 'L-FE177D64', ServiceCode: 'iam' },
    customerManagedPolicies: { QuotaCode: 'L-E95E4862', ServiceCode: 'iam' },
    managedPoliciesPerRole: { QuotaCode: 'L-0DA4ABF3', ServiceCode: 'iam' },
};

type CallbackContext = Record<string, any>;

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
    public async create(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        const model = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);

        LOGGER.info({ handler: 'create', request, callbackContext });
        model.resourceId = 'iam-quotas'; // there can only be one

        if (session instanceof SessionProxy) {
            const serviceQuotas = session.client('ServiceQuotas') as ServiceQuotas;
            await UpsertQuotas(serviceQuotas, new ResourceModel(), model, quotaCodeForPropertyName, LOGGER);
        } else {
            throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
        }
        progress.status = OperationStatus.Success;
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
    public async update(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        const desired = new ResourceModel(request.desiredResourceState);
        const previous = new ResourceModel(request.previousResourceState);

        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(desired);

        LOGGER.info({ handler: 'update', request, callbackContext });

        if (session instanceof SessionProxy) {
            const serviceQuotas = session.client('ServiceQuotas') as ServiceQuotas;
            await UpsertQuotas(serviceQuotas, previous, desired, quotaCodeForPropertyName, LOGGER);
        } else {
            throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
        }
        progress.status = OperationStatus.Success;
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
    public async delete(session: Optional<SessionProxy>): Promise<ProgressEvent> {
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>();
        if (session instanceof SessionProxy) {
            session.client('ServiceQuotas') as ServiceQuotas;
        } else {
            throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
        }
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
    public async read(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>): Promise<ProgressEvent> {
        const model = new ResourceModel(request.desiredResourceState);
        // TODO: put code here
        const progress = ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
        if (session instanceof SessionProxy) {
            session.client('ServiceQuotas') as ServiceQuotas;
        } else {
            throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
        }
        return progress;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
