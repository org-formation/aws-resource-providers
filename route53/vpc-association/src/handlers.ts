import { Route53 } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';

import { ResourceModel, VPC } from './models';

class Resource extends BaseResource<ResourceModel> {
    private async createVpcAssociation(action: Action, service: Route53, logger: Logger, model: ResourceModel): Promise<ResourceModel> {
        const request: Route53.AssociateVPCWithHostedZoneRequest = {
            HostedZoneId: model.hostedZoneId,
            VPC: {
                VPCId: model.vPC.vPCId,
                VPCRegion: model.vPC.vPCRegion,
            },
        };
        logger.log({ action, message: 'before invoke associateVPCWithHostedZone', request });
        const response = await service.associateVPCWithHostedZone(request).promise();
        logger.log({ action, message: 'after invoke associateVPCWithHostedZone', response });
        logger.log({ action, message: 'done', model });
        model.resourceId = `${model.hostedZoneId}/${model.vPC.vPCRegion}/${model.vPC.vPCId}`;
        return model;
    }

    private async deleteVpcAssociation(action: Action, service: Route53, logger: Logger, model: ResourceModel): Promise<null> {
        const request: Route53.DisassociateVPCFromHostedZoneRequest = {
            HostedZoneId: model.hostedZoneId,
            VPC: {
                VPCId: model.vPC.vPCId,
                VPCRegion: model.vPC.vPCRegion,
            },
        };
        logger.log({ action, message: 'before invoke disassociateVPCFromHostedZone', request });
        const response = await service.disassociateVPCFromHostedZone(request).promise();
        logger.log({ action, message: 'after invoke disassociateVPCFromHostedZone', response });
        logger.log({ action, message: 'done', model });
        return null;
    }

    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'Route53', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: Route53, model: ResourceModel): Promise<ResourceModel> {
        if (model.resourceId) throw new exceptions.InvalidRequest('Read only property [ResourceId] cannot be provided by the user.');
        return this.createVpcAssociation(action, service, args.logger, model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'Route53', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: Route53, model: ResourceModel): Promise<ResourceModel> {
        if (model.resourceId) throw new exceptions.InvalidRequest('Read only property [ResourceId] cannot be provided by the user.');
        return this.createVpcAssociation(action, service, args.logger, model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'Route53', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: Route53, model: ResourceModel): Promise<null> {
        return this.deleteVpcAssociation(action, service, args.logger, model);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
