import { Route53 } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    Logger,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';

import { ResourceModel, TypeConfigurationModel, VPC } from './models';

type CallbackContext = Record<string, never>;

class Resource extends BaseResource<ResourceModel> {
    private async createVpcAssociationAuthorization(
        model: ResourceModel,
        logger: LoggerProxy,
        progress: ProgressEvent<ResourceModel, CallbackContext>,
        route53: Route53
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const request: Route53.CreateVPCAssociationAuthorizationRequest = {
            HostedZoneId: model.hostedZoneId,
            VPC: {
                VPCId: model.vPC.vPCId,
                VPCRegion: model.vPC.vPCRegion,
            },
        };
        model.resourceId = `${model.hostedZoneId}/${model.vPC.vPCRegion}/${model.vPC.vPCId}`;
        try {
            logger.log({ message: 'before invoke createVPCAssociationAuthorization', request });
            const response = await route53.createVPCAssociationAuthorization(request).promise();
            logger.log({ message: 'after invoke createVPCAssociationAuthorization', response });
            logger.log({ message: 'done', model });
            progress.status = OperationStatus.Success;
            return progress;
        } catch (err: any) {
            console.log(err);
            const errorCode = err.code || err.name;
            if (errorCode === 'ConcurrentModification') {
                return progress;
            }
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    private async deleteVpcAssociationAuthorization(action: Action, service: Route53, logger: Logger, model: ResourceModel): Promise<null> {
        const request: Route53.DeleteVPCAssociationAuthorizationRequest = {
            HostedZoneId: model.hostedZoneId,
            VPC: {
                VPCId: model.vPC.vPCId,
                VPCRegion: model.vPC.vPCRegion,
            },
        };
        logger.log({ action, message: 'before invoke deleteVPCAssociationAuthorization', request });
        const response = await service.deleteVPCAssociationAuthorization(request).promise();
        logger.log({ action, message: 'after invoke deleteVPCAssociationAuthorization', response });
        logger.log({ action, message: 'done', model });
        return null;
    }

    private async listVPCAssociationAuthorizations(action: Action, service: Route53, logger: Logger, model: ResourceModel): Promise<Route53.VPC[]> {
        const request: Route53.ListVPCAssociationAuthorizationsRequest = { HostedZoneId: model.hostedZoneId };
        logger.log({ action, message: 'before invoke createVPCAssociationAuthorization', request });
        let vpcs: Array<Route53.VPC> = [];
        let response = await service.listVPCAssociationAuthorizations(request).promise();
        vpcs = vpcs.concat(response.VPCs);
        logger.log({ action, message: 'after invoke createVPCAssociationAuthorization', response });
        logger.log({ action, message: 'done', model });
        while (response.NextToken) {
            logger.log({ action, message: 'before invoke createVPCAssociationAuthorization', request });
            response = await service.listVPCAssociationAuthorizations(request).promise();
            vpcs = vpcs.concat(response.VPCs);
            logger.log({ action, message: 'after invoke createVPCAssociationAuthorization', response });
            logger.log({ action, message: 'done', model });
        }
        return vpcs;
    }

    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const route53: Route53 = session.client<Route53>('Route53');
        const model: ResourceModel = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);
        return this.createVpcAssociationAuthorization(model, logger, progress, route53);
    }

    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const route53: Route53 = session.client<Route53>('Route53');
        const model: ResourceModel = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);
        return this.createVpcAssociationAuthorization(model, logger, progress, route53);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'Route53', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: Route53, model: ResourceModel): Promise<null> {
        return this.deleteVpcAssociationAuthorization(action, service, args.logger, model);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'Route53', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: Route53, model: ResourceModel): Promise<ResourceModel> {
        const [hostedZoneId, vpcRegion, vpcId] = model.resourceId.split('/');
        const vpcs = await this.listVPCAssociationAuthorizations(action, service, args.logger, model);
        const targetVpc = vpcs.find((vpc) => vpc.VPCId === vpcId && vpc.VPCRegion === vpcRegion);
        if (!targetVpc) throw new exceptions.NotFound(this.typeName, model.resourceId);
        model.hostedZoneId = hostedZoneId;
        model.vPC = VPC.deserialize({
            vPCRegion: vpcRegion,
            vPCId: vpcId,
        });
        return model;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
