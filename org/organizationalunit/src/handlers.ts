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
import { Organizations } from 'aws-sdk';
// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

interface CallbackContext extends Record<string, any> {}


const convertArnToId = (arn: string) => {
    const allParts = arn.split('/');
    return allParts[allParts.length -1];
}

const parentIdOrRootId = async (client: Organizations, parentId?: string): Promise<string> => {

    if (typeof parentId !== 'string' || parentId === '') {
        const roots = await client.listRoots().promise();
        return roots.Roots[0].Id;
    }
    if (typeof parentId === 'string' && parentId.includes('/')) {
        const allParts = parentId.split('/');
        return allParts[allParts.length -1];
    }
    return parentId;
}

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
        callbackContext: any,
    ): Promise<ProgressEvent> {
        LOGGER.info('create');
        LOGGER.info(callbackContext);

        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);

        if (callbackContext && callbackContext.CallbackToken === undefined) {
            progress.callbackDelaySeconds = 1;
            progress.callbackContext = { CallbackToken: 'second time' };
            model.arn = 'temp id' + request.clientRequestToken + 'booha';
            return progress;
        }


        try {
            LOGGER.info(request);
            LOGGER.info(model);
            if (session instanceof SessionProxy) {
                const client = session.client('Organizations') as Organizations;
                const parentId = await parentIdOrRootId(client, model.parentOU);
                
                const createRequest: Organizations.Types.CreateOrganizationalUnitRequest = {
                    Name: model.organizationalUnitName,
                    ParentId: parentId
                };
                LOGGER.info(createRequest)
                const result = await client.createOrganizationalUnit(createRequest).promise();
                LOGGER.info(result);
                model.id = result.OrganizationalUnit.Id; //would this work?
                model.arn = result.OrganizationalUnit.Arn; //would this work?
            }
            progress.status = OperationStatus.Success;
        } catch(err) {
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
        LOGGER.info('update');

        const model: ResourceModel = request.desiredResourceState;
        const prevModel: ResourceModel = request.previousResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        
        LOGGER.info(request);
        LOGGER.info(model);
        LOGGER.info(prevModel);
        
        if (model.parentOU !== prevModel.parentOU) {
            progress.status = OperationStatus.Failed;
            progress.message = `cannot change parentOU on resource of type ${model.getTypeName()}`;
            return progress;
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
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
    ): Promise<ProgressEvent> {
        LOGGER.info('delete');
        const model: ResourceModel = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        LOGGER.info(request);
        LOGGER.info(model);
        try {
            if (session instanceof SessionProxy) {
                const client = session.client('Organizations') as Organizations;

                const deleteRequest: Organizations.Types.DeleteOrganizationalUnitRequest = {
                    OrganizationalUnitId: convertArnToId(model.arn) //would have been better if this is done using Id
                };
                LOGGER.info(deleteRequest);
                const result = await client.deleteOrganizationalUnit(deleteRequest).promise();
                LOGGER.info(result);
            }
            progress.status = OperationStatus.Success;
        } catch(err) {
            LOGGER.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
        }
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

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
