import {
    Action,
    BaseResource,
    exceptions,
    HandlerErrorCode,
    handlerEvent,
    Logger,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { DirectConnect } from 'aws-sdk';
import { Tag as DirectConnectTag } from 'aws-sdk/clients/directconnect';
import { ResourceModel, Tag as ModelledTag, TypeConfigurationModel } from './models';

type CallbackContext = {
    id: string;
};
class Resource extends BaseResource<ResourceModel> {
    private constructArn(account: string, region: string, vifId: string): string {
        return `arn:aws:directconnect:${region}:${account}:dxvif/${vifId}`;
    }

    private modelledToRealTags(inputTags: ModelledTag[] | undefined): DirectConnectTag[] {
        if (inputTags === undefined) {
            return [];
        }
        return Array.from(inputTags).map((t) => {
            return { key: t.key!, value: t.value_ };
        });
    }

    private realToModelledTags(inputTags: DirectConnectTag[] | undefined): ModelledTag[] {
        if (inputTags === undefined) {
            return [];
        }
        return Array.from(inputTags).map((t) => {
            return new ModelledTag(t);
        });
    }

    async getVlanFromConnection(dc: DirectConnect, connectionId: string, logger: Logger): Promise<number> {
        try {
            const response = await dc.describeConnections({ connectionId: connectionId }).promise();
            logger.log({ message: 'after describeConnections', response });
            const vlan = response.connections?.[0]?.vlan;
            if (!vlan) {
                throw new exceptions.GeneralServiceException('Unable to obtain vlan from connection', HandlerErrorCode.ServiceInternalError);
            }
            logger.log({ message: 'returning vlan: ' + vlan });
            return vlan;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    async createTransitVirtualInterface(dc: DirectConnect, model: ResourceModel, logger: Logger): Promise<string> {
        const vlan = await this.getVlanFromConnection(dc, model.connectionId, logger);
        const req: DirectConnect.CreateTransitVirtualInterfaceRequest = {
            connectionId: model.connectionId,
            newTransitVirtualInterface: {
                addressFamily: model.addressFamily,
                amazonAddress: model.amazonAddress,
                asn: model.asn,
                authKey: model.authKey,
                customerAddress: model.customerAddress,
                directConnectGatewayId: model.directConnectGatewayId,
                enableSiteLink: model.enableSiteLink,
                mtu: model.mtu,
                tags: this.modelledToRealTags(model.tags),
                virtualInterfaceName: model.virtualInterfaceName,
                vlan: vlan,
            },
        };

        try {
            logger.log({ message: 'before createTransitVirtualInterface', req });
            const response = await dc.createTransitVirtualInterface(req).promise();
            logger.log({ message: 'after createTransitVirtualInterface', response });
            logger.log({ message: 'returning virtualInterfaceId: ' + response.virtualInterface.virtualInterfaceId });
            return response.virtualInterface.virtualInterfaceId;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    async getTransitVirtualInterface(dc: DirectConnect, model: ResourceModel, logger: Logger): Promise<ResourceModel> {
        const request: DirectConnect.DescribeVirtualInterfacesRequest = {
            virtualInterfaceId: model.virtualInterfaceId,
        };

        try {
            logger.log({ message: 'before describeVirtualInterfaces', request });
            const response = await dc.describeVirtualInterfaces(request).promise();
            logger.log({ message: 'after describeVirtualInterfaces', response });

            model.addressFamily = response.virtualInterfaces[0]?.addressFamily;
            model.amazonAddress = response.virtualInterfaces[0]?.amazonAddress;
            model.asn = response.virtualInterfaces[0]?.asn;
            model.connectionId = response.virtualInterfaces[0]?.connectionId;
            model.customerAddress = response.virtualInterfaces[0]?.customerAddress;
            model.directConnectGatewayId = response.virtualInterfaces[0]?.directConnectGatewayId;
            model.enableSiteLink = response.virtualInterfaces[0]?.siteLinkEnabled;
            model.mtu = response.virtualInterfaces[0]?.mtu;
            model.ownerAccount = response.virtualInterfaces[0]?.ownerAccount;
            model.virtualInterfaceId = response.virtualInterfaces[0]?.virtualInterfaceId;
            model.virtualInterfaceName = response.virtualInterfaces[0]?.virtualInterfaceName;
            model.virtualInterfaceState = response.virtualInterfaces[0]?.virtualInterfaceState;
            model.vlan = response.virtualInterfaces[0]?.vlan;
            model.arn = this.constructArn(model.ownerAccount, dc.config?.region, model.virtualInterfaceId);
            model.tags = this.realToModelledTags(response.virtualInterfaces[0]?.tags);
            logger.log({ message: 'done', model });
            return model;
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    async updateTransitVirtualInterface(dc: DirectConnect, model: ResourceModel, logger: Logger): Promise<void> {
        const request: DirectConnect.UpdateVirtualInterfaceAttributesRequest = {
            virtualInterfaceId: model.virtualInterfaceId,
            enableSiteLink: model.enableSiteLink,
            mtu: model.mtu,
            virtualInterfaceName: model.virtualInterfaceName,
        };

        try {
            logger.log({ message: 'before updateVirtualInterfaceAttributes', request });
            const response = await dc.updateVirtualInterfaceAttributes(request).promise();
            logger.log({ message: 'after updateVirtualInterfaceAttributes', response });
            model.ownerAccount = response.ownerAccount;
            await this.updateTags(dc, model, logger);
            logger.log({ message: 'done updating' });
        } catch (err: any) {
            console.log(err);
            throw new exceptions.GeneralServiceException(err.message, err.code);
        }
    }

    async updateTags(dc: DirectConnect, model: ResourceModel, logger: Logger): Promise<void> {
        const arn = this.constructArn(model.ownerAccount, dc.config?.region, model.virtualInterfaceId);
        logger.log({ message: 'getting tags for ' + arn });
        const currentTags = (await dc.describeTags({ resourceArns: [arn] }).promise()).resourceTags[0]?.tags ?? [];
        logger.log({ message: 'current tags', currentTags });
        const desiredTags = this.modelledToRealTags(model.tags);
        logger.log({ message: 'desired tags', desiredTags });
        const tagKeysToDelete = currentTags.filter((currTag) => !desiredTags.find((desTag) => currTag.key === desTag.key)).map((delTag) => delTag.key);
        logger.log({ message: 'tag keys to delete', tagKeysToDelete });
        if (tagKeysToDelete.length > 0) {
            await dc.untagResource({ resourceArn: arn, tagKeys: tagKeysToDelete }).promise();
        }
        await dc.tagResource({ resourceArn: arn, tags: desiredTags }).promise();
    }

    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const dc: DirectConnect = session.client<DirectConnect>('DirectConnect');

        const model: ResourceModel = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);

        // first call - initiate creation
        if (callbackContext.id === undefined) {
            const vifId = await this.createTransitVirtualInterface(dc, model, logger);
            progress.callbackContext = { id: vifId };
            progress.callbackDelaySeconds = 60;
            model.virtualInterfaceId = vifId;
            return progress;
        }
        // we're being called back after IN_PROGESS - check if the interface is ready
        model.virtualInterfaceId = callbackContext.id;
        const vif = await this.getTransitVirtualInterface(dc, model, logger);

        if (vif.virtualInterfaceState !== 'pending') {
            progress.status = OperationStatus.Success;
            progress.resourceModel = vif;
            progress.callbackDelaySeconds = 20;
        }
        return progress;
    }

    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const dc: DirectConnect = session.client<DirectConnect>('DirectConnect');

        const model: ResourceModel = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);

        // first call - initiate update
        if (callbackContext.id === undefined) {
            await this.updateTransitVirtualInterface(dc, model, logger);
            progress.callbackContext = { id: model.virtualInterfaceId };
            progress.callbackDelaySeconds = 60;
            return progress;
        }
        // we're being called back after IN_PROGESS - check if the interface is ready
        model.virtualInterfaceId = callbackContext.id;
        const vif = await this.getTransitVirtualInterface(dc, model, logger);

        if (vif.virtualInterfaceState !== 'pending') {
            progress.status = OperationStatus.Success;
            progress.resourceModel = vif;
            progress.callbackDelaySeconds = 20;
        }
        return progress;
    }

    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationModel
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const dc: DirectConnect = session.client<DirectConnect>('DirectConnect');

        const model: ResourceModel = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);

        // first call - initiate creation
        if (callbackContext.id === undefined) {
            const req: DirectConnect.DeleteVirtualInterfaceRequest = {
                virtualInterfaceId: model.virtualInterfaceId,
            };

            try {
                logger.log({ message: 'before deleteVirtualInterface', request });
                const response = await dc.deleteVirtualInterface(req).promise();
                logger.log({ message: 'after deleteVirtualInterface', response });
            } catch (err: any) {
                console.log(err);
                throw new exceptions.GeneralServiceException(err.message, err.code);
            }
            progress.callbackContext = { id: model.virtualInterfaceId };
            progress.callbackDelaySeconds = 60;
            return progress;
        }
        // we're being called back after IN_PROGESS - check if the interface is gone
        const vif = await this.getTransitVirtualInterface(dc, model, logger);
        if (vif.virtualInterfaceState !== 'deleting') {
            progress.status = OperationStatus.Success;
            progress.resourceModel = null;
            progress.callbackDelaySeconds = 20;
        }
        return progress;
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'DirectConnect', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: DirectConnect, model: ResourceModel): Promise<ResourceModel> {
        return await this.getTransitVirtualInterface(service, model, args.logger);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
