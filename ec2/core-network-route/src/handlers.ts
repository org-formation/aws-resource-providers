import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { EC2 } from 'aws-sdk';
import { CreateRouteRequest, CreateRouteResult, DeleteRouteRequest } from 'aws-sdk/clients/ec2';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        const request: CreateRouteRequest = {
            DestinationCidrBlock: model.destinationCidrBlock,
            DestinationIpv6CidrBlock: model.destinationIpv6CidrBlock,
            CoreNetworkArn: model.coreNetworkArn,
            RouteTableId: model.routeTableId,
        };

        try {
            args.logger.log({ action, message: 'before createRoute', request });
            const response: CreateRouteResult = await service.createRoute(request).promise();
            args.logger.log({ action, message: 'after createRoute', response });

            model.id = `${model.routeTableId}:${model.destinationCidrBlock}:${model.destinationIpv6CidrBlock}:${model.coreNetworkArn}`;
            args.logger.log({ action, message: 'done', model });
            return model;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
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
