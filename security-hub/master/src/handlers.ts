import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { ResourceModel } from './models';
import { BaseResource, handlerEvent, Action } from 'cfn-rpdk';
import { AcceptInvitationRequest } from 'aws-sdk/clients/securityhub';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;
const versionCode = '1';

interface LogContext {
    handler: 'Create' | 'Update' | 'Delete',
    versionCode: string;
    clientRequestToken: string;
}

interface CallbackContext extends Record<string, any> {}

async function acceptMaster(desiredModel: ResourceModel, loggingContext: LogContext, service: SecurityHub) {

    LOGGER.info({ ...loggingContext, method: 'acceptMaster', desiredModel });

    const invitations = await service.listInvitations().promise();
    LOGGER.info({ ...loggingContext, method: 'after listInvitations', invitations });

    for(const invitation of invitations.Invitations) {
        if (invitation.AccountId === desiredModel.masterAccountId) {
            const acceptInvitationRequest: AcceptInvitationRequest = { InvitationId: invitation.InvitationId, MasterId: desiredModel.masterAccountId };

            LOGGER.info({ ...loggingContext, method: 'before acceptInvitation', acceptInvitationRequest });
            const acceptResponse = await service.acceptInvitation(acceptInvitationRequest).promise();
            LOGGER.info({ ...loggingContext, method: 'after acceptInvitation', acceptResponse });
        }
    }

    LOGGER.info({ ...loggingContext, method: 'acceptMaster', desiredModel });

}

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'SecurityHub', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub): Promise<ResourceModel> {
        const { desiredResourceState, awsAccountId, clientRequestToken } = args.request;
        const loggingContext : LogContext = { handler: 'Create', clientRequestToken: clientRequestToken, versionCode };

        LOGGER.info({ ...loggingContext, message: 'begin', args });
        await acceptMaster(desiredResourceState, loggingContext, service);

        desiredResourceState.resourceId = `arn:community::${awsAccountId}:securityhub:master`;

        LOGGER.info({ ...loggingContext, message: 'done', desiredResourceState });
        return desiredResourceState;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'SecurityHub', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub): Promise<ResourceModel> {
        const { desiredResourceState, clientRequestToken } = args.request;
        const loggingContext : LogContext = { handler: 'Update', clientRequestToken: clientRequestToken, versionCode };

        LOGGER.info({ ...loggingContext, message: 'begin', args });
        await acceptMaster(desiredResourceState, loggingContext, service);

        LOGGER.info({ ...loggingContext, message: 'done' });
        return desiredResourceState;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'SecurityHub', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub): Promise<ResourceModel> {
        const { desiredResourceState, clientRequestToken } = args.request;
        const loggingContext : LogContext = { handler: 'Delete', clientRequestToken: clientRequestToken, versionCode };

        LOGGER.info({ ...loggingContext, message: 'noop', args });

        return desiredResourceState;
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
