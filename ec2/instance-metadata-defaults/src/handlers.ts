import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    HandlerErrorCode,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel, TypeConfigurationModel } from './models';
import { DefaultInstanceMetadataEndpointState, EC2, InstanceMetadataTagsState, MetadataDefaultHttpTokensState } from "@aws-sdk/client-ec2"

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
     * @param typeConfiguration Configuration data for this resource type, in the given account
     * and region
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel,
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        const client = new EC2({credentials: session.configuration.credentials})

        await client.modifyInstanceMetadataDefaults( {
            HttpTokens: (model.httpTokens ?? "no-preference") as MetadataDefaultHttpTokensState,
            HttpPutResponseHopLimit: model.httpPutResponseHopLimit === undefined ? undefined : Number(model.httpPutResponseHopLimit),
            HttpEndpoint: (model.httpEndpoint ?? "no-preference") as DefaultInstanceMetadataEndpointState,
            InstanceMetadataTags: (model.instanceMetadataTags ?? "no-preference") as InstanceMetadataTagsState
        })
        model.resourceId = 'default-instance-metadata';
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
     * @param typeConfiguration Configuration data for this resource type, in the given account
     * and region
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel,
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        const client = new EC2({credentials: session.configuration.credentials})

        await client.modifyInstanceMetadataDefaults( {
            HttpTokens: (model.httpTokens ?? "no-preference") as MetadataDefaultHttpTokensState,
            HttpPutResponseHopLimit: model.httpPutResponseHopLimit === undefined ? undefined : Number(model.httpPutResponseHopLimit),
            HttpEndpoint: (model.httpEndpoint ?? "no-preference") as DefaultInstanceMetadataEndpointState,
            InstanceMetadataTags: (model.instanceMetadataTags ?? "no-preference") as InstanceMetadataTagsState
        })
        
        progress.status = OperationStatus.Success;
        return progress;
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
     * @param typeConfiguration Configuration data for this resource type, in the given account
     * and region
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel,
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        const client = new EC2({credentials: session.configuration.credentials})

        await client.modifyInstanceMetadataDefaults( {
            HttpTokens: "no-preference",
            HttpPutResponseHopLimit: -1,
            HttpEndpoint: "no-preference",
            InstanceMetadataTags: "no-preference"
        });
        
        progress.status = OperationStatus.Success;
        return progress;
    }

}

// @ts-ignore // if running against v1.0.1 or earlier of plugin the 5th argument is not known but best to ignored (runtime code may warn)
export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel)!;

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
