import { Action, BaseResource, exceptions, handlerEvent, OperationStatus, Optional, ProgressEvent, ResourceHandlerRequest, SessionProxy } from 'cfn-rpdk';
import { ResourceModel } from './models';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

export interface CallbackContext extends Record<string, any> {
    Remaining?: number;
}

export class Resource extends BaseResource<ResourceModel> {
    static DEFAULT_DURATION = 60;
    static MAX_DURATION = 43200; // 12 hours in seconds

    /**
     * Used to parse and convert the duration (string) to seconds (number)
     *
     * @param duration Duration in ISO8601 format
     */
    static parseDuration(duration: string): number {
        const pattern = /^PT(?=[0-9])(([0-9]+)H)?(([0-9]+)M)?(([0-9]+)S)?$/;
        const timeParts = pattern.exec(duration);
        if (!timeParts) {
            throw new exceptions.InvalidRequest(`Invalid duration format has been passed: ${duration}`);
        }
        const hours = timeParts[2] === undefined ? 0 : parseInt(timeParts[2]);
        const minutes = timeParts[4] === undefined ? 0 : parseInt(timeParts[4]);
        const seconds = (hours * 60 + minutes) * 60 + (timeParts[6] === undefined ? 0 : parseInt(timeParts[6]));
        if (seconds > this.MAX_DURATION) {
            throw new exceptions.InvalidRequest(`Value (${seconds.toString()}) is greater than allowed duration (${this.MAX_DURATION})`);
        }
        return seconds;
    }

    /**
     * Build progress event to respond with sucess when the total duration has elapsed or
     * with re-invocation every 10 minutes.
     *
     * @param progress Contains the initial progress event to be used as starting point
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param resourceId The unique identifier for this resource
     * @param model Already modelled desired state data
     */
    private buildProgress(progress: ProgressEvent<ResourceModel>, callbackContext: CallbackContext, resourceId: string, model?: ResourceModel): ProgressEvent<ResourceModel> {
        let remaining: number = callbackContext.Remaining ?? null;
        model = progress.resourceModel || model;
        if (remaining === null) {
            model.resourceId = resourceId;
            remaining = model.duration ? Resource.parseDuration(model.duration) : Resource.DEFAULT_DURATION;
        }
        LOGGER.info('OPERATION remaining', remaining);

        if (remaining <= 0) {
            progress.callbackDelaySeconds = 0;
            progress.status = OperationStatus.Success;
        } else {
            progress.callbackContext = {
                Remaining: remaining - 600,
            };
            progress.callbackDelaySeconds = remaining < 600 ? remaining : 600;
        }
        console.info('OPERATION progress', progress);
        return progress;
    }

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
        console.info('CREATE request', request);
        console.info('CREATE callbackContext', callbackContext);
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        return this.buildProgress(progress, callbackContext, request.clientRequestToken);
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
        console.info('UPDATE request', request);
        console.info('UPDATE callbackContext', callbackContext);
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        return this.buildProgress(progress, callbackContext, request.previousResourceState.resourceId);
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
    public async delete(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        console.info('DELETE request', request);
        console.info('DELETE callbackContext', callbackContext);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>();
        return this.buildProgress(progress, callbackContext, request.clientRequestToken, request.desiredResourceState);
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
    public async read(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        console.info('READ request', request);
        const model: ResourceModel = request.desiredResourceState;
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
    public async list(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        console.info('LIST request', request);
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>().status(OperationStatus.Success).resourceModels([model]).build();
        return progress;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
