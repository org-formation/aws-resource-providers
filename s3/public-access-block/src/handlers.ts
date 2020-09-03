import {
    Action,
    BaseResource,
    SessionProxy,
    exceptions
} from 'cfn-rpdk';
import { ResourceModel } from './models';
import { S3Control, STS } from 'aws-sdk'
import { WrapHandler, ResourceProviderHandler, HandlerArgs } from './common';
import { PutPublicAccessBlockRequest, DeletePublicAccessBlockRequest, GetPublicAccessBlockRequest } from 'aws-sdk/clients/s3control';

class Resource extends BaseResource<ResourceModel> { }

const upsertAccountPublicAccessBlockHandler: ResourceProviderHandler<S3Control, ResourceModel> = async (action: Action, args: HandlerArgs, service: S3Control): Promise<ResourceModel> => {
    const model = args.request.desiredResourceState;

    const accountId = args.request.awsAccountId;

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

    const result = new ResourceModel(model);
    result.resourceId = accountId;

    console.info({action, message: 'done', result});
    return result;
}

const deletePublicAccountBlockHandler: ResourceProviderHandler<S3Control, ResourceModel> = async (action: Action, args: HandlerArgs, service: S3Control) : Promise<null>  => {

    const request: DeletePublicAccessBlockRequest = {
        AccountId: args.request.awsAccountId
    };

    console.info({ action, message: 'before invoke deletePublicAccessBlock', request });
    const response = await service.deletePublicAccessBlock(request).promise();
    console.info({ action, message: 'after invoke deletePublicAccessBlock', response });

    console.info({action, message: 'done'});

    return Promise.resolve(null);
}

const readPublicAccountBlockHandler: ResourceProviderHandler<S3Control, ResourceModel> = async (action: Action, args: HandlerArgs, service: S3Control): Promise<ResourceModel>  => {
    const accountId = args.request.awsAccountId;

    const request: GetPublicAccessBlockRequest = {
        AccountId: accountId
    };

    console.info({ action, message: 'before invoke getPublicAccessBlock', request });
    try {
        const response = await service.getPublicAccessBlock(request).promise();
        console.info({ action, message: 'after invoke getPublicAccessBlock', response });

        const publicAccessBlock = response.PublicAccessBlockConfiguration;

        const result = new ResourceModel();
        result.blockPublicAcls = publicAccessBlock.BlockPublicAcls;
        result.blockPublicPolicy = publicAccessBlock.BlockPublicPolicy;
        result.ignorePublicAcls = publicAccessBlock.IgnorePublicAcls;
        result.restrictPublicBuckets = publicAccessBlock.RestrictPublicBuckets;
        result.resourceId = accountId;

        console.info({action, message: 'done', result});

        return Promise.resolve(result);
    } catch (err) {
        if (err && err.code === 'NoSuchPublicAccessBlockConfiguration') {
            throw new exceptions.NotFound(
                ResourceModel.TYPE_NAME,
                request.AccountId
            );
        } else { // Raise the original exception
            throw err;
        }
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);
resource.addHandler(Action.Create, WrapHandler(Action.Create, 'S3Control', upsertAccountPublicAccessBlockHandler));
resource.addHandler(Action.Update, WrapHandler(Action.Update, 'S3Control', upsertAccountPublicAccessBlockHandler));
resource.addHandler(Action.Delete, WrapHandler(Action.Delete, 'S3Control', deletePublicAccountBlockHandler));
resource.addHandler(Action.Read, WrapHandler(Action.Read, 'S3Control', readPublicAccountBlockHandler));

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;