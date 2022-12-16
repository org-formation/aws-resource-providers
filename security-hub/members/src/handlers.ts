/* eslint-disable prettier/prettier */
import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';

const versionCode = '1';

interface LogContext {
    handler: Action;
    versionCode: string;
    clientRequestToken: string;
}

async function inviteMembers(memberAccountIDs: string[], logger: Logger, loggingContext: LogContext, service: SecurityHub) {
    if (memberAccountIDs.length === 0) {
        return;
    }

    logger.log({ ...loggingContext, method: 'inviteMembers', memberAccountIDs });

    const accountDetails = memberAccountIDs.map((x) => ({ AccountId: x }));

    const createRequest = {
        AccountDetails: accountDetails,
    };

    logger.log({ ...loggingContext, method: 'before createMembers', memberAccountIDs, createRequest });
    const createResponse = await service.createMembers(createRequest).promise();
    logger.log({ ...loggingContext, method: 'after createMembers', memberAccountIDs, createRequest, createResponse });

    const filteredUnprocessedCreate = createResponse.UnprocessedAccounts?.filter(x=>x.ProcessingResult && !x.ProcessingResult.includes("given account ID is already a member or associated"));

    if (filteredUnprocessedCreate?.length) {
        throw new Error(`Unable to process all invitations: Unprocessed Accounts ${createResponse.UnprocessedAccounts.map((x) => x.AccountId).join(',')}`);
    }

    const inviteRequest = {
        AccountIds: memberAccountIDs,
    } as SecurityHub.Types.InviteMembersRequest;

    logger.log({ ...loggingContext, method: 'before inviteMembers', memberAccountIDs, inviteRequest });
    const inviteResponse = await service.inviteMembers(inviteRequest).promise();
    logger.log({ ...loggingContext, method: 'after inviteMembers', memberAccountIDs, inviteRequest, inviteResponse });

    const filteredUnprocessed = inviteResponse.UnprocessedAccounts?.filter(x=>x.ProcessingResult && !x.ProcessingResult.includes("because the current account has already invited or is already the SecurityHub"));

    if (filteredUnprocessed?.length) {
        throw new Error(`Unable to process all invitations: Unprocessed Accounts ${inviteResponse.UnprocessedAccounts.map((x) => x.AccountId).join(',')}`);
    }
}


class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'begin', args });

        if (model.memberAccountIDs === undefined) {
            throw new exceptions.InternalFailure(`memberAccountIds are undefined`);
        }

        await inviteMembers(model.memberAccountIDs, args.logger, loggingContext, service);

        model.resourceId = `arn:community::${awsAccountId}:securityhub:member-invitations`;

        args.logger.log({ ...loggingContext, message: 'done', model });
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const previousState = args.request.previousResourceState;
        const { clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        const previousMemberIds = previousState.memberAccountIDs ?? [];
        const desiredMemberIds = model.memberAccountIDs ?? [];
        const mewMemberIds = desiredMemberIds.filter((x) => !previousMemberIds.includes(x));
        args.logger.log({ ...loggingContext, message: 'begin', args });

        await inviteMembers(mewMemberIds, args.logger, loggingContext, service);

        args.logger.log({ ...loggingContext, message: 'done' });
        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<null> {
        const { clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'noop', args });

        return null;
    }
}
export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
