/* eslint-disable prettier/prettier */
import { IAM } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';


const versionCode = '1';

interface LogContext {
    handler: Action;
    versionCode: string;
    clientRequestToken: string;
}

interface PolicyDocumentStatement {
    Effect: "Allow" | "Deny";
    Action: string | string[];
    Resource: string | string[];
    Sid: string;
}

interface PolicyDocument {
    Version: "2012-10-17";
    Statement: PolicyDocumentStatement[];
}
const sleep = async (millis: number): Promise<void> => {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, millis);
    });
};

const fixPath = (policyPath: string) => {
    if (policyPath === undefined || policyPath === "") {
        return policyPath = "/";
    }
    if (policyPath) {
        if (policyPath[0] !== "/") policyPath = `/${policyPath}`;
        if (policyPath[policyPath.length - 1] !== "/") policyPath = `${policyPath}/`;
    }
    return policyPath;
};

const createPolicyArn = (awsAccountId: string, policyName: string, policyPath: string) => `arn:aws:iam::${awsAccountId}:policy${fixPath(policyPath)}${policyName}`;

export const getPolicyDocument = async (service: IAM, awsAccountId: string, policyName: string, policyPath: string) => {
    try {
        const policyArn = createPolicyArn(awsAccountId, policyName, policyPath);
        const policy = await service.getPolicy({ PolicyArn: policyArn }).promise();
        const policyVersion = await service.getPolicyVersion({ PolicyArn: policyArn, VersionId: policy.Policy.DefaultVersionId }).promise();
        return JSON.parse(decodeURIComponent(policyVersion.PolicyVersion.Document)) as PolicyDocument;
    } catch (err) {
        if (err.name === "NoSuchEntity") {
            return {
                Version: "2012-10-17",
                Statement: []
            } as PolicyDocument;
        }
        throw err;
    }
};

const putPolicyDocument = async (service: IAM, awsAccountId: string, policyName: string, policyPath: string, policyDocument: PolicyDocument) => {
    try {
        const policyArn = createPolicyArn(awsAccountId, policyName, policyPath);
        const { PolicyVersion: policyVersion } = await service.createPolicyVersion({ PolicyArn: policyArn, PolicyDocument: JSON.stringify(policyDocument), SetAsDefault: true }).promise();
        return policyVersion.VersionId;
    } catch (err) {
        if (err.name === "NoSuchEntity") {
            const { Policy: policy } = await service.createPolicy({ PolicyName: policyName, Path: fixPath(policyPath), PolicyDocument: JSON.stringify(policyDocument) }).promise();
            return policy.DefaultVersionId;
        }
        throw err;
    }
};

const checkPolicyDocument = async (service: IAM, awsAccountId: string, policyName: string, policyPath: string, expectedVersion: string) => {
    const policyArn = createPolicyArn(awsAccountId, policyName, policyPath);
    const policy = await service.getPolicy({ PolicyArn: policyArn }).promise();
    return expectedVersion === policy.Policy.DefaultVersionId;
};

const deleteVersions = async (service: IAM, awsAccountId: string, policyName: string, policyPath: string) => {
    try {
        const policyArn = createPolicyArn(awsAccountId, policyName, policyPath);
        const versions = await service.listPolicyVersions({ PolicyArn: policyArn }).promise();
        for (const version of versions.Versions) {
            if (!version.IsDefaultVersion) {
                await service.deletePolicyVersion({ PolicyArn: policyArn, VersionId: version.VersionId }).promise();
            }
        }
    } catch (err) {
        if (err.name === "NoSuchEntity") {
            return;
        }
        throw err;
    }
};


export const updatePolicyWithStatement = async (service: IAM, awsAccountId: string, model: ResourceModel) => {
    let confirmReadRightVersion = false;

    const { managedPolicyName: policyName, managedPolicyPath: policyPath, statementId, statementJson } = model;

    do {
        await sleep(Math.random() * 1000);
        await deleteVersions(service, awsAccountId, policyName, policyPath);
        try {
            const policyDoc = await getPolicyDocument(service, awsAccountId, policyName, policyPath);
            const otherStatements = policyDoc.Statement.filter(x => x.Sid !== statementId);
            const statement = statementJson ? { ...JSON.parse(statementJson), Sid: statementId } as PolicyDocumentStatement : undefined;
            const newPolicyDocument = { ...policyDoc, Statement: [...otherStatements, ...(statement ? [statement] : [])] } as PolicyDocument;
            const newVersion = await putPolicyDocument(service, awsAccountId, policyName, policyPath, newPolicyDocument);
            confirmReadRightVersion = await checkPolicyDocument(service, awsAccountId, policyName, policyPath, newVersion);
        } catch (err) {
            if (err.name === "LimitExceeded") {
                await sleep(Math.random() * 1000);
                confirmReadRightVersion = false;
            }
        }

    } while (!confirmReadRightVersion);

};

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: IAM, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };
        args.logger.log({ ...loggingContext, message: 'begin', args });

        const policyArn = createPolicyArn(awsAccountId, model.managedPolicyName, model.managedPolicyPath);
        model.resourceId = `${policyArn}#${model.statementId}`;

        await updatePolicyWithStatement(service, awsAccountId, model);

        args.logger.log({ ...loggingContext, message: 'done', model });
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: IAM, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        args.logger.log({ ...loggingContext, message: 'begin', args });

        await updatePolicyWithStatement(service, awsAccountId, model);

        args.logger.log({ ...loggingContext, message: 'done' });
        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: IAM, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<null> {
        const previousState = args.request.previousResourceState;
        const { awsAccountId, clientRequestToken } = args.request;
        const loggingContext: LogContext = { handler: action, clientRequestToken: clientRequestToken, versionCode };

        previousState.statementJson = undefined;
        await updatePolicyWithStatement(service, awsAccountId, previousState);

        args.logger.log({ ...loggingContext, message: 'noop', args });

        return null;
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
