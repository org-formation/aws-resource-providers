import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, handlerEvent, Logger } from 'cfn-rpdk';

import { ResourceModel } from './models';

const versionCode = '1';

interface LogContext {
    handler: Action;
    versionCode: string;
    clientRequestToken: string;
}

async function acceptMaster(desiredModel: ResourceModel, logger: Logger, loggingContext: LogContext, service: SecurityHub) {
    logger.log({ ...loggingContext, method: 'acceptMaster', desiredModel });

    const invitations = await service.listInvitations().promise();
    logger.log({ ...loggingContext, method: 'after listInvitations', invitations });

    for (const invitation of invitations.Invitations) {
        if (invitation.AccountId === desiredModel.masterAccountId) {
            const acceptInvitationRequest: SecurityHub.AcceptInvitationRequest = { InvitationId: invitation.InvitationId, MasterId: desiredModel.masterAccountId };

            logger.log({ ...loggingContext, method: 'before acceptInvitation', acceptInvitationRequest });
            const acceptResponse = await service.acceptInvitation(acceptInvitationRequest).promise();
            logger.log({ ...loggingContext, method: 'after acceptInvitation', acceptResponse });
        }
    }

    logger.log({ ...loggingContext, method: 'acceptMaster', desiredModel });
}

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'begin', args });
        await acceptMaster(model, args.logger, loggingContext, service);

        model.resourceId = `arn:community::${awsAccountId}:securityhub:master`;

        args.logger.log({ ...loggingContext, message: 'done', model });
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'begin', args });
        await acceptMaster(model, args.logger, loggingContext, service);

        args.logger.log({ ...loggingContext, message: 'done' });
        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>): Promise<null> {
        const { clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'noop', args });

        return null;
    }

    @handlerEvent(Action.Read)
    @commonAws({ service: SecurityHub, debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, _service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'noop', args });

        return model;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
