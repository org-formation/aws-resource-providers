import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { SecurityHub } from 'aws-sdk';
import { ResourceModel, TypeConfigurationModel } from './models';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';

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
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const invitations = await service.listInvitations().promise();

        const foundInvite = invitations.Invitations.find((invitation) => invitation.AccountId === model.masterAccountId && invitation.MemberStatus === 'Invited');
        if (!foundInvite) throw new exceptions.NotFound(`Unable to find invite from ${model.masterAccountId}.`, model.masterAccountId);

        const acceptInvitationRequest: SecurityHub.AcceptInvitationRequest = { InvitationId: foundInvite.InvitationId, MasterId: model.masterAccountId };

        await service.acceptInvitation(acceptInvitationRequest).promise();

        model.resourceId = 'Accepted/' + model.masterAccountId;
        return model;
    }
    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        throw new exceptions.NotUpdatable();
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<null> {
        return Promise.resolve(null);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
