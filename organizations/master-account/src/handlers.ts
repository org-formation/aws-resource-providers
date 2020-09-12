import { Action, BaseResource, exceptions, handlerEvent, HandlerErrorCode, OperationStatus, Optional, ProgressEvent, ResourceHandlerRequest, SessionProxy } from 'cfn-rpdk';
import { ResourceModel } from './models';
import { Organizations } from 'aws-sdk';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

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
        LOGGER.info('create');
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);

        LOGGER.info(request);
        LOGGER.info(model);

        if (session instanceof SessionProxy) {
            const client = session.client('Organizations') as Organizations;

            model.id = '123123123123';
            model.arn = 'aws::arn::account::' + model.id;
        } else {
            throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
        }
        // Setting Status to success will signal to CloudFormation that the operation is complete
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
        LOGGER.info('update');

        const model: ResourceModel = request.desiredResourceState;
        const prevModel: ResourceModel = request.previousResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);

        LOGGER.info(request);
        LOGGER.info(model);
        LOGGER.info(prevModel);

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
    public async delete(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        LOGGER.info('delete');
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>();

        LOGGER.info(request);
        LOGGER.info(model);
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
    public async read(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
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
    public async list(session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> {
        const model: ResourceModel = request.desiredResourceState;
        // TODO: put code here
        const progress = ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>().status(OperationStatus.Success).resourceModels([model]).build();
        return progress;
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
