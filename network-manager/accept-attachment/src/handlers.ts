import {
    Action,
    BaseResource,
    handlerEvent,
    Logger,
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

const waitingStates = ['CREATING', 'PENDING_NETWORK_UPDATE', 'PENDING', "PENDING_TAG_ACCEPTANCE"];

type CallbackContext = {
    id: string;
    type: string;
};

class Resource extends BaseResource<ResourceModel> {
    private async getAttachment(id: string, type: string, service: NetworkManager, model: ResourceModel, logger:Logger): Promise<ResourceModel> {
        switch (type) {
            case 'VPC':
                const { VpcAttachment } = await service.getVpcAttachment({ AttachmentId: model.attachmentId }).promise();
                model.id = VpcAttachment.Attachment.AttachmentId;
                model.attachmentId = VpcAttachment.Attachment.AttachmentId;
                model.attachmentType = VpcAttachment.Attachment.AttachmentType;
                model.attachmentState = VpcAttachment.Attachment.State;
                return model;
            case 'CONNECT':
                const { ConnectAttachment } = await service.getConnectAttachment({ AttachmentId: model.attachmentId }).promise();    
                model.id = ConnectAttachment.Attachment.AttachmentId;
                model.attachmentId = ConnectAttachment.Attachment.AttachmentId;
                model.attachmentType = ConnectAttachment.Attachment.AttachmentType;
                model.attachmentState = ConnectAttachment.Attachment.State;
                return model;
            case 'SITE_TO_SITE_VPN':
                const { SiteToSiteVpnAttachment } = await service.getSiteToSiteVpnAttachment({ AttachmentId: model.attachmentId }).promise();    
                model.id = SiteToSiteVpnAttachment.Attachment.AttachmentId;
                model.attachmentId = SiteToSiteVpnAttachment.Attachment.AttachmentId;
                model.attachmentType = SiteToSiteVpnAttachment.Attachment.AttachmentType;
                model.attachmentState = SiteToSiteVpnAttachment.Attachment.State;
                return model;
            case 'TRANSIT_GATEWAY_ROUTE_TABLE':
                const { TransitGatewayRouteTableAttachment } = await service.getTransitGatewayRouteTableAttachment({ AttachmentId: model.attachmentId }).promise();    
                model.id = TransitGatewayRouteTableAttachment.Attachment.AttachmentId;
                model.attachmentId = TransitGatewayRouteTableAttachment.Attachment.AttachmentId;
                model.attachmentType = TransitGatewayRouteTableAttachment.Attachment.AttachmentType;
                model.attachmentState = TransitGatewayRouteTableAttachment.Attachment.State;
                return model;
        }

        throw new Error(`Unsupported attachment type: ${type}`);
    }

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
            // fetch the attachment and accept the attachment if needed.
            logger.log({ message: `before get (${model.attachmentType}) attachment` });
            const attachment = await this.getAttachment(model.attachmentId, model.attachmentType, service, model, logger);
            logger.log({ message: `after get (${model.attachmentType}) attachment` });
            progress.callbackContext = { id: attachment.attachmentId, type: attachment.attachmentType };

            // If available, no need to create attachment return success.
            if (attachment.attachmentState === 'AVAILABLE') {
                progress.status = OperationStatus.Success;
                progress.resourceModel = attachment;
                return progress;
            }

            // If pending acceptance, accept the attachment.
            if (attachment.attachmentState === 'PENDING_ATTACHMENT_ACCEPTANCE') {
                logger.log({ message: 'before accept attachment' });
                const { Attachment } = await service.acceptAttachment({ AttachmentId: model.attachmentId }).promise();
                logger.log({ message: 'after accept attachment', Attachment });
                
                progress.callbackDelaySeconds = 60;
                model.id = Attachment.AttachmentId;
                model.attachmentId = Attachment.AttachmentId;
                model.attachmentType = Attachment.AttachmentType;
                model.attachmentState = Attachment.State;
                return progress;
            }

            return progress;
        }

        // we're being called back after IN_PROGESS - check if the interface is ready
        logger.log({ message: `before get (${callbackContext.type}) attachment` });
        const attachment = await this.getAttachment(callbackContext.id, callbackContext.type, service, model, logger);
        logger.log({ message: `after get (${callbackContext.type}) attachment` });

        model.id = attachment.id;
        model.attachmentId = attachment.attachmentId;
        model.attachmentType = attachment.attachmentType;
        model.attachmentState = attachment.attachmentState;

        // Check when succeded.
        if (model.attachmentState === 'AVAILABLE') {
            progress.status = OperationStatus.Success;
            progress.resourceModel = model;
            return progress;
        }

        // Check whether to wait or if it failed.
        if (waitingStates.includes(model.attachmentState)) {
            progress.status = OperationStatus.InProgress;
            progress.message = `Waiting for attachment to become AVAILABLE, current state: ${model.attachmentState}`;
            progress.resourceModel = model;
            progress.callbackDelaySeconds = 30;
            return progress;
        } else {
            progress.status = OperationStatus.Failed; 
            progress.message = `Resource creation failed as attachment state is '${model.attachmentState}', it cannot become 'AVAILABLE'`;
            progress.resourceModel = model;
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
        return this.getAttachment(model.attachmentId, model.attachmentType, service, model, args.logger);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
