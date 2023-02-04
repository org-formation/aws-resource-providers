import {
    Action,
    BaseResource,
    exceptions,
    HandlerErrorCode,
    handlerEvent,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { EC2, NetworkManager } from 'aws-sdk';
import { CreateRouteRequest, CreateRouteResult, DeleteRouteRequest } from 'aws-sdk/clients/ec2';
import { ResourceModel, TypeConfigurationModel } from './models';

type CallbackContext = {
    timeStarted: number;
};

const VPC_ATTACHMENT_TERMINAL_FAILED_STATES = ['FAILED', 'REJECTED', 'DELETING'];
const MAX_WAIT_SECONDS = 600;

class Resource extends BaseResource<ResourceModel> {
    async createRoute(model: ResourceModel, logger: LoggerProxy, progress: ProgressEvent<ResourceModel, CallbackContext>, ec2: EC2): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const createRouteRequest: CreateRouteRequest = {
            DestinationCidrBlock: model.destinationCidrBlock,
            DestinationIpv6CidrBlock: model.destinationIpv6CidrBlock,
            CoreNetworkArn: model.coreNetworkArn,
            RouteTableId: model.routeTableId,
        };

        try {
            logger.log({ message: 'before createRoute', createRouteRequest });
            const response: CreateRouteResult = await ec2.createRoute(createRouteRequest).promise();
            logger.log({ message: 'after createRoute', response });

            model.id = `${model.routeTableId}:${model.destinationCidrBlock}:${model.destinationIpv6CidrBlock}:${model.coreNetworkArn}`;
            logger.log({ message: 'done', model });
            progress.status = OperationStatus.Success;
            return progress;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const nm: NetworkManager = session.client<NetworkManager>('NetworkManager');
        const ec2: EC2 = session.client<EC2>('EC2');

        const model: ResourceModel = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);
        logger.log(model);

        const vpcAttachmentId = model.vpcAttachmentId;

        // if no waiting, create the route immediately
        if (vpcAttachmentId === undefined) {
            logger.log({ message: 'create called without waiting enabled. Returning immediate create.', vpcAttachmentId });
            return await this.createRoute(model, logger, progress, ec2);
        }

        logger.log({ message: 'create called with waiting enabled', vpcAttachmentId });
        const { VpcAttachment } = await nm.getVpcAttachment({ AttachmentId: vpcAttachmentId }).promise();
        const attachmentState = VpcAttachment.Attachment.State;
        logger.log({ message: 'vpcAttachmentId state', attachmentState, vpcAttachmentId });

        // create route if state is available
        if (attachmentState === 'AVAILABLE') {
            return await this.createRoute(model, logger, progress, ec2);
        }

        // error out if we can already see the state will never become available
        if (VPC_ATTACHMENT_TERMINAL_FAILED_STATES.includes(attachmentState)) {
            progress.status = OperationStatus.Failed;
            progress.errorCode = HandlerErrorCode.GeneralServiceException;
            progress.message = `Cannot create route since VPC Attachment ${vpcAttachmentId} is in state ${attachmentState}`;
            return progress;
        }

        // return in_progress if this is the first call
        if (callbackContext.timeStarted === undefined) {
            logger.log('First call');
            progress.status = OperationStatus.InProgress;
            progress.callbackContext = {
                timeStarted: new Date().getTime() / 1000,
            };
            return progress;
        }

        // this is the subsequent call. check that we're not going over time.
        const nowSeconds = new Date().getTime() / 1000;
        const secondsSinceStart = Math.round(nowSeconds - callbackContext.timeStarted);
        if (secondsSinceStart > MAX_WAIT_SECONDS) {
            progress.status = OperationStatus.Failed;
            progress.errorCode = HandlerErrorCode.GeneralServiceException;
            progress.message = `VPC Attachment ${vpcAttachmentId} is (still) in state ${attachmentState} after waiting to reach state AVAILABLE for ${secondsSinceStart} seconds which is longer than the maximum configured of ${MAX_WAIT_SECONDS}.`;
            return progress;
        }

        // return in progress
        progress.status = OperationStatus.InProgress;
        return progress;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<null> {
        const elements = model.id.split(':');
        const request: DeleteRouteRequest = {
            RouteTableId: elements[0],
            DestinationCidrBlock: elements[1] === 'undefined' ? undefined : elements[1],
            DestinationIpv6CidrBlock: elements[2] === 'undefined' ? undefined : elements[1],
        };

        try {
            args.logger.log({ action, message: 'before deleteRoute', request });
            const response = await service.deleteRoute(request).promise();
            args.logger.log({ action, message: 'after deleteRoute', response });
            return null;
        } catch (err: any) {
            if (err.code === 'InvalidRoute.NotFound') {
                return null;
            }
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        // this shouldn't do anything because all properties are createOnly.
        return model;
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        const elements = model.id.split(':');
        model.routeTableId = elements[0];
        model.destinationCidrBlock = elements[1];
        model.destinationIpv6CidrBlock = elements[2];
        model.coreNetworkArn = elements[3];
        args.logger.log({ action, message: 'done', model });
        return model;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
