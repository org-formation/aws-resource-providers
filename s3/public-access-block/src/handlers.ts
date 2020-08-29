import {
    Action,
    BaseResource,
    SessionProxy
} from 'cfn-rpdk';
import { ResourceModel } from './models';
import { S3Control, STS } from 'aws-sdk'
import { WrapHandler, ResourceProviderHandler, HandlerArgs } from './common';
import { PutPublicAccessBlockRequest } from 'aws-sdk/clients/s3control';

const getAccountId = async (session: SessionProxy): Promise<string> => {
    const sts = session.client('STS') as STS;
    const response = await sts.getCallerIdentity().promise();
    return response.Account;
}

async function putAccountPublicAccessBlock(action: Action, args: HandlerArgs, model: ResourceModel, service: S3Control) {
    console.info({ action, message: 'before getting account Id' });
    const accountId = await getAccountId(args.session);
    console.info({ action, message: 'after getting account Id', accountId });

    const request: PutPublicAccessBlockRequest = {
        AccountId: accountId,
        PublicAccessBlockConfiguration: {
            BlockPublicAcls: model.blockPublicAcls,
            IgnorePublicAcls: model.ignorePublicAcls,
            BlockPublicPolicy: model.blockPublicPolicy,
            RestrictPublicBuckets: model.restrictPublicBuckets
        }
    };

    console.info({ action, message: 'before invoke putPublicAccessBlock', request });
    const response = await service.putPublicAccessBlock(request).promise();
    console.info({ action, message: 'after invoke putPublicAccessBlock', response });
    
    return accountId;
}

const UpsertAccountPublicAccessBlockHandler: ResourceProviderHandler<S3Control> = async (action: Action, args: HandlerArgs, service: S3Control)  => {
    const model = args.request.desiredResourceState;

    const accountId = await putAccountPublicAccessBlock(action, args, model, service);
    model.resourceId = accountId;

    console.info({action, message: 'done', model});
}

const DeletePublicAccountBlockHandler: ResourceProviderHandler<S3Control> = async (action: Action, args: HandlerArgs, service: S3Control)  => {
    putAccountPublicAccessBlock(action, args, {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
    } as any, service);

    console.info({action, message: 'done'});
}

const EmptyHandler: ResourceProviderHandler<S3Control> = async (action: Action, args: HandlerArgs, service: S3Control)  => {
    console.info({action, message: 'not implemented'});
    return Promise.resolve();
};


class Resource extends BaseResource<ResourceModel> { }

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);
resource.addHandler(Action.Create, WrapHandler(Action.Create, 'S3Control', UpsertAccountPublicAccessBlockHandler));
resource.addHandler(Action.Update, WrapHandler(Action.Update, 'S3Control', UpsertAccountPublicAccessBlockHandler));
resource.addHandler(Action.Delete, WrapHandler(Action.Delete, 'S3Control', DeletePublicAccountBlockHandler));
resource.addHandler(Action.List, WrapHandler(Action.List, 'S3Control', EmptyHandler));
resource.addHandler(Action.Read, WrapHandler(Action.Read, 'S3Control', EmptyHandler));

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;