import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Detective, SecurityHub } from 'aws-sdk';
import { ResourceModel, TypeConfigurationModel } from './models';

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
    @commonAws({ service: Detective, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: Detective, model: ResourceModel): Promise<ResourceModel> {
        const { managementAccountId } = model;

        const invitations = await service.listInvitations({}).promise();
        const invite = invitations.Invitations.find((x) => x.Status === 'INVITED' && x.MasterId === managementAccountId);
        if (!invite) throw new exceptions.NotFound('Community::Detective::Management', 'No Invite found in Status: INVITED from account: ' + managementAccountId);

        await service.acceptInvitation({ GraphArn: invite.GraphArn as string }).promise();

        model.resourceId = 'Accepted/' + managementAccountId;
        return model;
    }
    @handlerEvent(Action.Update)
    @commonAws({ service: Detective, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: Detective, model: ResourceModel): Promise<ResourceModel> {
        throw new exceptions.NotUpdatable();
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: Detective, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: Detective, model: ResourceModel): Promise<null> {
        return Promise.resolve(null);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
