import {
    Action,
    BaseResource,
    handlerEvent,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { NetworkManager } from 'aws-sdk';
import { ResourceModel } from './models';

const waitingStates = ['CREATING', 'PENDING_NETWORK_UPDATE', 'PENDING'];

type CallbackContext = {
    id: string;
    type: string;
};
class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const service: NetworkManager = session.client<NetworkManager>('NetworkManager', { region: 'us-west-2' });

        const model: ResourceModel = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);

        // first call - initiate creation
        if (callbackContext.id === undefined) {
            logger.log({ message: 'before accept attachment' });
            const { Attachment } = await service.acceptAttachment({ AttachmentId: model.attachmentId }).promise();
            logger.log({ message: 'after accept attachment', Attachment });
            progress.callbackContext = { id: Attachment.AttachmentId, type: Attachment.AttachmentType };
            progress.callbackDelaySeconds = 60;
            model.id = Attachment.AttachmentId;
            model.attachmentId = Attachment.AttachmentId;
            model.attachmentType = Attachment.AttachmentType;
            model.attachmentState = Attachment.State;

            return progress;
        }
        // we're being called back after IN_PROGESS - check if the interface is ready
        model.id = callbackContext.id;

        if (callbackContext.type === 'VPC') {
            logger.log({ message: 'before get vpc attachment' });
            const result = await service.getVpcAttachment({ AttachmentId: model.attachmentId }).promise();
            logger.log({ message: 'after get vpc attachment' });

            model.id = result.VpcAttachment.Attachment.AttachmentId;
            model.attachmentId = result.VpcAttachment.Attachment.AttachmentId;
            model.attachmentType = result.VpcAttachment.Attachment.AttachmentType;
            model.attachmentState = result.VpcAttachment.Attachment.State;
        } else {
            logger.log({ message: 'before get vpc attachment' });
            const result = await service.getConnectAttachment({ AttachmentId: model.attachmentId }).promise();
            logger.log({ message: 'after get vpc attachment' });

            model.id = result.ConnectAttachment.Attachment.AttachmentId;
            model.attachmentId = result.ConnectAttachment.Attachment.AttachmentId;
            model.attachmentType = result.ConnectAttachment.Attachment.AttachmentType;
            model.attachmentState = result.ConnectAttachment.Attachment.State;
        }

        // Check when succeded.
        if (model.attachmentState === 'AVAILABLE') {
            progress.status = OperationStatus.Success;
            progress.resourceModel = model;
            return progress;
        }

        // Check for when in progress.
        if (waitingStates.includes(model.attachmentState)) {
            progress.status = OperationStatus.InProgress;
            progress.resourceModel = model;
            progress.callbackDelaySeconds = 30;
            return progress;
        } else {
            // Check for failed state.
            progress.status = OperationStatus.Failed;
            progress.resourceModel = model;
            progress.callbackDelaySeconds = 30;
            return progress;
        }
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'NetworkManager', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: NetworkManager, model: ResourceModel): Promise<ResourceModel> {
        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'NetworkManager', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: NetworkManager, model: ResourceModel): Promise<ResourceModel> {
        return model;
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'NetworkManager', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: NetworkManager, model: ResourceModel): Promise<ResourceModel> {
        if (model.attachmentType === 'VPC') {
            args.logger.log({ message: 'before get vpc attachment' });
            const result = await service.getVpcAttachment({ AttachmentId: model.attachmentId }).promise();
            args.logger.log({ message: 'after get vpc attachment' });
            model.id = result.VpcAttachment.Attachment.AttachmentId;
            model.attachmentId = result.VpcAttachment.Attachment.AttachmentId;
            model.attachmentType = result.VpcAttachment.Attachment.AttachmentType;
            model.attachmentState = result.VpcAttachment.Attachment.State;
        } else {
            args.logger.log({ message: 'before get connect attachment' });
            const result = await service.getConnectAttachment({ AttachmentId: model.attachmentId }).promise();
            args.logger.log({ message: 'after get connect attachment' });

            model.id = result.ConnectAttachment.Attachment.AttachmentId;
            model.attachmentId = result.ConnectAttachment.Attachment.AttachmentId;
            model.attachmentType = result.ConnectAttachment.Attachment.AttachmentType;
            model.attachmentState = result.ConnectAttachment.Attachment.State;
        }
        return model;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
