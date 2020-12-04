import { Organizations, Support } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel } from './models';
import { CreateCaseRequest } from 'aws-sdk/clients/support';

export async function createSupportCase(model: ResourceModel, service: Support): Promise<void> {

    if (model.disableSupportCaseCreation) {
        return;
    }

    const createCaseRequest: CreateCaseRequest = {
        subject: `Enable ${model.supportLevel} support for account: ${model.accountId}`,
        communicationBody: `Hi AWS,
        Please enable ${model.supportLevel} on account ${model.accountId}.
        This case was created automatically - please resolve when done.

        Thank you!
            `,
        serviceCode: 'customer-account',
        categoryCode: 'other-account-issues',
        severityCode: 'low',
        issueType: 'customer-service',
        ccEmailAddresses: model.cCEmailAddresses,
    };

    await service.createCase(createCaseRequest).promise();
}

async function checkContextIsOrganizationMasterAccount(args: HandlerArgs<ResourceModel, Record<string, any>>): Promise<void> {
    try {
        const organizationsClient = args.session.client('Organizations', { region: 'us-east-1' }) as Organizations;
        await organizationsClient.describeOrganization().promise();
    } catch (err) {
        throw new exceptions.InvalidRequest(`Account does not seem to be the master account of an AWS Organization.\n${err}`);
    }
}

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'Support', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: Support, model: ResourceModel): Promise<ResourceModel> {
        const targetAccountId = args.request.awsAccountId;

        await checkContextIsOrganizationMasterAccount(args);
        await createSupportCase(model, service);

        model.arn = `arn:community:organizations::${targetAccountId}:support/support-level-${model.accountId}`;

        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'Support', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: Support, model: ResourceModel): Promise<ResourceModel> {
        if (args.request.previousResourceState.supportLevel !== args.request.desiredResourceState.supportLevel) {
            await createSupportCase(model, service);
        }

        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'Support', debug: true })
    public async delete(): Promise<null> {
        return null;
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
