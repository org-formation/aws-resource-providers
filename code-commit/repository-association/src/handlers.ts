import { AWSError, CodeCommit, Response } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from 'cfn-rpdk';
import { ResourceModel } from './models';

type CodeCommitBatchOutput = CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesOutput | CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesOutput;
type CodeCommitBatchResponse = CodeCommitBatchOutput & { $response?: Response<CodeCommitBatchOutput, AWSError> };

class Resource extends BaseResource<ResourceModel> {
    static extractResourceId(arn: string): string {
        if (arn.length) {
            return arn.split('/').pop();
        }
        return arn;
    }

    static formatArn(region: string, awsAccountId: string, resourceId: string): string {
        if (region && awsAccountId && resourceId) {
            return `arn:community:codecommit:${region}:${awsAccountId}:repository-association/${resourceId}`;
        }
        return null;
    }

    private async listRepositories(service: CodeCommit, logger: Logger, model: ResourceModel): Promise<ResourceModel> {
        const request: CodeCommit.ListRepositoriesForApprovalRuleTemplateInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
        };
        try {
            logger.log({ message: 'before invoke listRepositoriesForApprovalRuleTemplate', request });
            const response = await service.listRepositoriesForApprovalRuleTemplate(request).promise();
            logger.log({ message: 'after invoke listRepositoriesForApprovalRuleTemplate', response });
            const result = new ResourceModel();
            result.approvalRuleTemplateName = model.approvalRuleTemplateName;
            result.repositoryNames = response.repositoryNames;
            result.arn = model.arn;

            return Promise.resolve(result);
        } catch (err) {
            if (err?.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound('ApprovalRuleTemplate', model.approvalRuleTemplateName);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    private async checkBatchResponse(response: CodeCommitBatchResponse, logger: Logger): Promise<CodeCommitBatchResponse> {
        if (response.errors?.length) {
            logger.log(response.errors);
            const err = Error(response.errors[0].errorMessage) as AWSError;
            err.requestId = response.$response?.requestId;
            err.code = response.errors[0].errorCode;
            throw err;
        }

        return response;
    }

    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, logicalResourceIdentifier, region } = args.request;

        if (model.arn) {
            throw new exceptions.InvalidRequest('Read only property [Arn] cannot be provided by the user.');
        }

        await this.listRepositories(service, args.logger, model)
            .catch((err: exceptions.BaseHandlerException) => {
                if (err instanceof exceptions.NotFound) {
                    throw err;
                }
                args.logger.log(err);
                return Promise.resolve(null);
            })
            .then((result: ResourceModel) => {
                if (result?.repositoryNames?.length) {
                    throw new exceptions.AlreadyExists(this.typeName, model.approvalRuleTemplateName || logicalResourceIdentifier);
                }
                return Promise.resolve(null);
            });

        const request: CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
            repositoryNames: model.repositoryNames,
        };

        args.logger.log({ action, message: 'after batchAssociateApprovalRuleTemplateWithRepositories', request });
        const response = await service.batchAssociateApprovalRuleTemplateWithRepositories(request).promise();
        args.logger.log({ action, message: 'after invoke batchAssociateApprovalRuleTemplateWithRepositories', response });
        await this.checkBatchResponse(response, args.logger);
        model.repositoryNames = response.associatedRepositoryNames;
        model.arn = Resource.formatArn(region, awsAccountId, model.approvalRuleTemplateName);

        args.logger.log({ action, message: 'done', model });
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { logicalResourceIdentifier, previousResourceState } = args.request;
        const { approvalRuleTemplateName, arn } = previousResourceState;
        if (!model.arn && !model.approvalRuleTemplateName) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        } else if (model.arn !== arn) {
            args.logger.log(this.typeName, `[NEW ${model.arn}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${arn}].`);
            throw new exceptions.NotUpdatable('Read only property [Arn] cannot be updated.');
        } else if (model.approvalRuleTemplateName !== approvalRuleTemplateName) {
            args.logger.log(
                this.typeName,
                `[NEW ${model.approvalRuleTemplateName}] [${logicalResourceIdentifier}]`,
                `does not match identifier from saved resource [OLD ${approvalRuleTemplateName}].`
            );
            throw new exceptions.NotUpdatable('Create only property [ApprovalRuleTemplateName] cannot be updated.');
        }

        const result = await this.listRepositories(service, args.logger, model);
        if (!result.repositoryNames?.length) {
            throw new exceptions.NotFound(this.typeName, approvalRuleTemplateName);
        }

        // First disassociate all repositories from previous state for the rule name
        const requestRemoval: CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesInput = {
            approvalRuleTemplateName,
            repositoryNames: previousResourceState.repositoryNames,
        };
        args.logger.log({ action, message: 'before batchDisassociateApprovalRuleTemplateFromRepositories', requestRemoval });
        const responseRemoval = await service.batchDisassociateApprovalRuleTemplateFromRepositories(requestRemoval).promise();
        args.logger.log({ action, message: 'after invoke batchDisassociateApprovalRuleTemplateFromRepositories', responseRemoval });
        await this.checkBatchResponse(responseRemoval, args.logger);

        // Then associate repositories from desired state to the rule name
        const request: CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesInput = {
            approvalRuleTemplateName,
            repositoryNames: model.repositoryNames,
        };
        args.logger.log({ action, message: 'before batchAssociateApprovalRuleTemplateWithRepositories', request });
        const response = await service.batchAssociateApprovalRuleTemplateWithRepositories(request).promise();
        args.logger.log({ action, message: 'after invoke batchAssociateApprovalRuleTemplateWithRepositories', response });
        await this.checkBatchResponse(response, args.logger);

        model.repositoryNames = response.associatedRepositoryNames;
        args.logger.log({ action, message: 'done', model });
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<null> {
        const { awsAccountId, logicalResourceIdentifier, region } = args.request;
        let { approvalRuleTemplateName, arn } = model;
        if (!approvalRuleTemplateName && !arn) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        }
        if (!arn) {
            arn = Resource.formatArn(region, awsAccountId, approvalRuleTemplateName);
        }
        if (!approvalRuleTemplateName) {
            approvalRuleTemplateName = Resource.extractResourceId(arn);
        }
        const result = await this.listRepositories(service, args.logger, model);
        if (!result.repositoryNames?.length) {
            throw new exceptions.NotFound(this.typeName, approvalRuleTemplateName);
        }
        const request: CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesInput = {
            approvalRuleTemplateName,
            repositoryNames: result.repositoryNames,
        };

        args.logger.log({ action, message: 'before invoke batchDisassociateApprovalRuleTemplateFromRepositories', request });
        const response = await service.batchDisassociateApprovalRuleTemplateFromRepositories(request).promise();
        args.logger.log({ action, message: 'after invoke batchDisassociateApprovalRuleTemplateFromRepositories', response });
        await this.checkBatchResponse(response, args.logger);

        args.logger.log({ action, message: 'done' });
        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, logicalResourceIdentifier, region } = args.request;
        let { approvalRuleTemplateName, arn } = model;
        if (!approvalRuleTemplateName && !arn) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        }
        if (!arn) {
            arn = Resource.formatArn(region, awsAccountId, approvalRuleTemplateName);
        }
        if (!approvalRuleTemplateName) {
            approvalRuleTemplateName = Resource.extractResourceId(arn);
        }
        const result = await this.listRepositories(service, args.logger, model);
        if (!result.repositoryNames?.length) {
            throw new exceptions.NotFound(this.typeName, model.approvalRuleTemplateName);
        }

        args.logger.log({ action, message: 'done', result });
        return Promise.resolve(result);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
