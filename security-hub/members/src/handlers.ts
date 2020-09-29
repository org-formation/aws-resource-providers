import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { ResourceModel } from './models';
import { BaseResource, handlerEvent, Action } from 'cfn-rpdk';
import { CreateMembersRequest, InviteMembersRequest } from 'aws-sdk/clients/securityhub';
import { InternalFailure } from 'cfn-rpdk/dist/exceptions';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;
const versionCode = '1';

interface LogContext {
    handler: 'Create' | 'Update' | 'Delete',
    versionCode: string;
    clientRequestToken: string;
}

async function inviteMembers(desiredModel: ResourceModel, loggingContext: LogContext, service: SecurityHub) {

    LOGGER.info({ ...loggingContext, method: 'inviteMembers', desiredModel });

    if (desiredModel.memberAccountIDs === undefined) {
        throw new InternalFailure(`memberAccountIds are undefined`);
    }
    const accountDetails = desiredModel.memberAccountIDs.map(x => ({ AccountId: x }));

    const createRequest = {
        AccountDetails: accountDetails
    };

    LOGGER.info({ ...loggingContext, method: 'before createMembers', desiredModel, createRequest });
    const createResponse = await service.createMembers(createRequest).promise();
    LOGGER.info({ ...loggingContext, method: 'after createMembers', desiredModel, createRequest, createResponse });

    
    const inviteRequest = {
        AccountIds: desiredModel.memberAccountIDs
    };
    LOGGER.info({ ...loggingContext, method: 'before inviteMembers', desiredModel, inviteRequest });
    const inviteResponse = await service.inviteMembers(inviteRequest).promise();
    LOGGER.info({ ...loggingContext, method: 'after inviteMembers', desiredModel, inviteRequest, inviteResponse });
}

interface CallbackContext extends Record<string, any> {}

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'SecurityHub', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub): Promise<ResourceModel> {
        const { desiredResourceState, awsAccountId, clientRequestToken } = args.request;
        const loggingContext : LogContext = { handler: 'Create', clientRequestToken: clientRequestToken, versionCode };

        LOGGER.info({ ...loggingContext, message: 'begin', args });
        await inviteMembers(desiredResourceState, loggingContext, service);

        desiredResourceState.resourceId = `arn:community::${awsAccountId}:securityhub:member-invitations`;

        LOGGER.info({ ...loggingContext, message: 'done', desiredResourceState });
        return desiredResourceState;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'SecurityHub', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub): Promise<ResourceModel> {
        const { desiredResourceState, clientRequestToken } = args.request;
        const loggingContext : LogContext = { handler: 'Update', clientRequestToken: clientRequestToken, versionCode };

        LOGGER.info({ ...loggingContext, message: 'begin', args });

        await inviteMembers(desiredResourceState, loggingContext, service);

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

