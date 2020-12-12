import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from 'cfn-rpdk';

import { ResourceModel } from './models';

const versionCode = '1';

interface LogContext {
    handler: Action;
    versionCode: string;
    clientRequestToken: string;
}

async function inviteMembers(desiredModel: ResourceModel, logger: Logger, loggingContext: LogContext, service: SecurityHub) {
    logger.log({ ...loggingContext, method: 'inviteMembers', desiredModel });

    if (desiredModel.memberAccountIDs === undefined) {
        throw new exceptions.InternalFailure(`memberAccountIds are undefined`);
    }
    const accountDetails = desiredModel.memberAccountIDs.map((x) => ({ AccountId: x }));

    const createRequest = {
        AccountDetails: accountDetails,
    };

    logger.log({ ...loggingContext, method: 'before createMembers', desiredModel, createRequest });
    const createResponse = await service.createMembers(createRequest).promise();
    logger.log({ ...loggingContext, method: 'after createMembers', desiredModel, createRequest, createResponse });

    const inviteRequest = {
        AccountIds: desiredModel.memberAccountIDs,
    };
    logger.log({ ...loggingContext, method: 'before inviteMembers', desiredModel, inviteRequest });
    const inviteResponse = await service.inviteMembers(inviteRequest).promise();
    logger.log({ ...loggingContext, method: 'after inviteMembers', desiredModel, inviteRequest, inviteResponse });
}

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'begin', args });
        await inviteMembers(model, args.logger, loggingContext, service);

        model.resourceId = `arn:community::${awsAccountId}:securityhub:member-invitations`;

        args.logger.log({ ...loggingContext, message: 'done', model });
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'begin', args });

        await inviteMembers(model, args.logger, loggingContext, service);

        args.logger.log({ ...loggingContext, message: 'done' });
        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, _service: SecurityHub, model: ResourceModel): Promise<null> {
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
