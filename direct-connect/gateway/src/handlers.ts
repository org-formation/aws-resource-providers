import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { DirectConnect } from 'aws-sdk';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'DirectConnect', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: DirectConnect, model: ResourceModel): Promise<ResourceModel> {
        const request = {
            amazonSideAsn: model.amazonSideAsn,
            directConnectGatewayName: model.directConnectGatewayName,
        };

        try {
            args.logger.log({ action, message: 'before createDirectConnectGateway', request });
            const response = await service.createDirectConnectGateway(request).promise();
            args.logger.log({ action, message: 'after createDirectConnectGateway', response });

            model.directConnectGatewayId = response.directConnectGateway.directConnectGatewayId;
            model.ownerAccount = response.directConnectGateway.ownerAccount;
            args.logger.log({ action, message: 'done', model });
            return model;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'DirectConnect', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: DirectConnect, model: ResourceModel): Promise<ResourceModel> {
        const request = {
            directConnectGatewayId: model.directConnectGatewayId,
            newDirectConnectGatewayName: model.directConnectGatewayName,
        };

        try {
            args.logger.log({ action, message: 'before updateDirectConnectGateway', request });
            const response = await service.updateDirectConnectGateway(request).promise();
            args.logger.log({ action, message: 'after updateDirectConnectGateway', response });

            model.directConnectGatewayId = response.directConnectGateway.directConnectGatewayId;
            model.directConnectGatewayName = response.directConnectGateway.directConnectGatewayName;
            model.ownerAccount = response.directConnectGateway.ownerAccount;
            model.amazonSideAsn = response.directConnectGateway.amazonSideAsn;
            args.logger.log({ action, message: 'done', model });
            return model;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'DirectConnect', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: DirectConnect, model: ResourceModel): Promise<null> {
        const request = {
            directConnectGatewayId: model.directConnectGatewayId,
        };

        try {
            args.logger.log({ action, message: 'before deleteDirectConnectGateway', request });
            const response = await service.deleteDirectConnectGateway(request).promise();
            args.logger.log({ action, message: 'after deleteDirectConnectGateway', response });
            return null;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'DirectConnect', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: DirectConnect, model: ResourceModel): Promise<ResourceModel> {
        const request = {
            directConnectGatewayId: model.directConnectGatewayId,
        };

        try {
            args.logger.log({ action, message: 'before describeDirectConnectGateways', request });
            const response = await service.describeDirectConnectGateways(request).promise();
            args.logger.log({ action, message: 'after describeDirectConnectGateways', response });

            model.directConnectGatewayName = response.directConnectGateways[0].directConnectGatewayName;
            model.amazonSideAsn = response.directConnectGateways[0].amazonSideAsn;
            model.ownerAccount = response.directConnectGateways[0].ownerAccount;
            args.logger.log({ action, message: 'done', model });
            return model;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
