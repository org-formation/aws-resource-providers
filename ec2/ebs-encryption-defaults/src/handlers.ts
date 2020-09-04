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
import { EC2 } from 'aws-sdk'

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

interface CallbackContext extends Record<string, any> {}

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

        LOGGER.info({handler: 'create', request, callbackContext, env: process.env});
        model.resourceId = 'region-defaults'; // there can only be one

        try {
            if (session instanceof SessionProxy) {
                if (model.defaultEbsEncryptionKeyId !== undefined || model.enableEbsEncryptionByDefault !== undefined) {
                    const ec2client = session.client('EC2') as EC2;
                    
                    if (model.enableEbsEncryptionByDefault === true) {
                        await ec2client.enableEbsEncryptionByDefault().promise();
                    } else if (model.enableEbsEncryptionByDefault === false) {
                        await ec2client.disableEbsEncryptionByDefault().promise();
                    }
                    
                    if (typeof model.defaultEbsEncryptionKeyId === 'string') {
                        await ec2client.modifyEbsDefaultKmsKeyId({ KmsKeyId: model.defaultEbsEncryptionKeyId}).promise();
                    }
                }
            } else {
                throw new Error('no aws session found - did you forget to register the execution role?');
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
        const model: ResourceModel = request.desiredResourceState;
        const prevModel: ResourceModel = request.previousResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        LOGGER.info({handler: 'update', request, callbackContext});

        try {
            if (session instanceof SessionProxy) {

                if (model.enableEbsEncryptionByDefault !== prevModel.enableEbsEncryptionByDefault) {
                    const ec2client = session.client('EC2') as EC2;
                    
                    if (model.enableEbsEncryptionByDefault === true) {
                        await ec2client.enableEbsEncryptionByDefault().promise();
                    } else {
                        await ec2client.disableEbsEncryptionByDefault().promise();
                    }
                }

                if (model.defaultEbsEncryptionKeyId !== prevModel.defaultEbsEncryptionKeyId) {
                    const ec2client = session.client('EC2') as EC2;
                    if (typeof model.defaultEbsEncryptionKeyId === 'string') {
                        await ec2client.modifyEbsDefaultKmsKeyId({ KmsKeyId: model.defaultEbsEncryptionKeyId}).promise();
                    } else {
                        await ec2client.resetEbsDefaultKmsKeyId().promise();
                    }
                }
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
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        LOGGER.info({handler: 'delete', request, callbackContext});

        try {
            if (session instanceof SessionProxy) {
                const ec2client = session.client('EC2') as EC2;
                
                if (model.enableEbsEncryptionByDefault === true) {
                    await ec2client.disableEbsEncryptionByDefault().promise();
                }
            
                if (typeof model.defaultEbsEncryptionKeyId === 'string') {
                    await ec2client.resetEbsDefaultKmsKeyId().promise();
                }
            
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

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
