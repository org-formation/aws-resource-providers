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
import { CreateRouteRequest, CreateRouteResult, DeleteRouteRequest, DescribeRouteTablesRequest } from 'aws-sdk/clients/ec2';
import { ResourceModel, TypeConfigurationModel } from './models';

type CallbackContext = {
    timeStarted: number;
};

const VPC_ATTACHMENT_TERMINAL_FAILED_STATES = ['FAILED', 'REJECTED', 'DELETING'];
const MAX_WAIT_SECONDS = 600;
const ID_SEPARATOR = "@";

class Resource extends BaseResource<ResourceModel> {
    async createRoute(model: ResourceModel, logger: LoggerProxy, progress: ProgressEvent<ResourceModel, CallbackContext>, ec2: EC2): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const createRouteRequest: CreateRouteRequest = {
            DestinationCidrBlock: model.destinationCidrBlock,
            CoreNetworkArn: model.coreNetworkArn,
            RouteTableId: model.routeTableId,
        };

        try {
            logger.log({ message: 'before createRoute', createRouteRequest });
            const response: CreateRouteResult = await ec2.createRoute(createRouteRequest).promise();
            logger.log({ message: 'after createRoute', response });

            model.id = [model.routeTableId, model.destinationCidrBlock, model.coreNetworkArn, model.vpcAttachmentId].join(ID_SEPARATOR);
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
        const nm: NetworkManager = session.client<NetworkManager>('NetworkManager', { region: 'us-west-2' });
        const ec2: EC2 = session.client<EC2>('EC2');

        const model: ResourceModel = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);
        logger.log(model);

        const vpcAttachmentId = model.vpcAttachmentId;
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
        const elements = model.id.split(ID_SEPARATOR);
        const request: DeleteRouteRequest = {
            RouteTableId: elements[0],
            DestinationCidrBlock: elements[1],
        };

        try {
            args.logger.log({ action, message: 'before deleteRoute', request });
            const response = await service.deleteRoute(request).promise();
            args.logger.log({ action, message: 'after deleteRoute', response });
            // wait 10 seconds to stabilize
            // await new Promise((resolve) => setTimeout(resolve, 10_000));
            return null;
        } catch (err: any) {
            if (err.code === 'InvalidRoute.NotFound') {
                throw new exceptions.NotFound(model.getTypeName(), model.id);
            }
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        const elements = model.id.split(ID_SEPARATOR);
        const request: DescribeRouteTablesRequest = {
            RouteTableIds: [elements[0]],
        };
        model.routeTableId = elements[0];
        model.destinationCidrBlock = elements[1];
        model.coreNetworkArn = elements[2];
        model.vpcAttachmentId = elements[3];

        args.logger.log({ action, message: 'before describeRouteTables', request });
        const response = await service.describeRouteTables(request).promise();
        args.logger.log({ action, message: 'after describeRouteTables', response });
        if (!response.RouteTables[0].Routes.some((r) => r.DestinationCidrBlock === model.destinationCidrBlock)) {
            args.logger.log({ action, message: 'throwing notFound as CIDR isnt present in Route Table' });
            throw new exceptions.NotFound(model.getTypeName(), model.id);
        }
        args.logger.log({ action, message: 'done', model });
        return model;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
