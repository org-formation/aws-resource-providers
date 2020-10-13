import { AWSError, CodeCommit, Response } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel } from './models';

type CodeCommitBatchOutput = CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesOutput | CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesOutput;
type CodeCommitBatchResponse = CodeCommitBatchOutput & { $response?: Response<CodeCommitBatchOutput, AWSError> };

class Resource extends BaseResource<ResourceModel> {
    private async checkBatchResponse(response: CodeCommitBatchResponse): Promise<CodeCommitBatchResponse> {
        if (response.errors?.length) {
            console.log(response.errors);
            const err = new AWSError(response.errors[0].errorMessage);
            err.requestId = response.$response.requestId;
            err.code = response.errors[0].errorCode;
            throw err;
        }

        return response;
    }

    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, clientRequestToken, region } = args.request;

        const request: CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
            repositoryNames: model.repositoryNames,
        };

        args.logger.log({ action, message: 'after batchAssociateApprovalRuleTemplateWithRepositories', request });
        const response = await service.batchAssociateApprovalRuleTemplateWithRepositories(request).promise();
        args.logger.log({ action, message: 'after invoke batchAssociateApprovalRuleTemplateWithRepositories', response });
        await this.checkBatchResponse(response);
        model.arn = `arn:community:codecommit:${region}:${awsAccountId}:repository-association/${clientRequestToken}`;

        args.logger.log({ action, message: 'done', model });
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { previousResourceState } = args.request;

        let added = model.repositoryNames;
        let deleted = previousResourceState.repositoryNames;
        if (model.approvalRuleTemplateName === previousResourceState.approvalRuleTemplateName) {
            added = model.repositoryNames.filter((element: string) => {
                return !previousResourceState.repositoryNames.includes(element);
            });
            deleted = previousResourceState.repositoryNames.filter((element: string) => {
                return !model.repositoryNames.includes(element);
            });
        }
        if (added.length > 0) {
            const request: CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesInput = {
                approvalRuleTemplateName: model.approvalRuleTemplateName,
                repositoryNames: added,
            };
            args.logger.log({ action, message: 'before batchAssociateApprovalRuleTemplateWithRepositories', request });
            const response = await service.batchAssociateApprovalRuleTemplateWithRepositories(request).promise();
            args.logger.log({ action, message: 'after invoke batchAssociateApprovalRuleTemplateWithRepositories', response });
            await this.checkBatchResponse(response);
        }
        if (deleted.length > 0) {
            const request: CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesInput = {
                approvalRuleTemplateName: previousResourceState.approvalRuleTemplateName,
                repositoryNames: deleted,
            };
            args.logger.log({ action, message: 'before batchDisassociateApprovalRuleTemplateFromRepositories', request });
            const response = await service.batchDisassociateApprovalRuleTemplateFromRepositories(request).promise();
            args.logger.log({ action, message: 'after invoke batchDisassociateApprovalRuleTemplateFromRepositories', response });
            await this.checkBatchResponse(response);
        }

        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<null> {
        const request: CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
            repositoryNames: model.repositoryNames,
        };

        args.logger.log({ action, message: 'before invoke batchDisassociateApprovalRuleTemplateFromRepositories', request });
        const response = await service.batchDisassociateApprovalRuleTemplateFromRepositories(request).promise();
        args.logger.log({ action, message: 'after invoke batchDisassociateApprovalRuleTemplateFromRepositories', response });
        await this.checkBatchResponse(response);

        args.logger.log({ action, message: 'done' });
        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { logicalResourceIdentifier } = args.request;

        if (!model.approvalRuleTemplateName) {
            throw new exceptions.NotFound(ResourceModel.TYPE_NAME, logicalResourceIdentifier);
        }

        const request: CodeCommit.ListRepositoriesForApprovalRuleTemplateInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
        };

        args.logger.log({ action, message: 'before invoke listRepositoriesForApprovalRuleTemplate', request });
        try {
            const response = await service.listRepositoriesForApprovalRuleTemplate(request).promise();
            args.logger.log({ action, message: 'after invoke listRepositoriesForApprovalRuleTemplate', response });

            const result = new ResourceModel();
            result.approvalRuleTemplateName = model.approvalRuleTemplateName;
            result.repositoryNames = response.repositoryNames;
            result.arn = model.arn;

            args.logger.log({ action, message: 'done', result });

            return Promise.resolve(result);
        } catch (err) {
            if (err && (err.code === 'ApprovalRuleTemplateDoesNotExistException' || err.code === 'RepositoryDoesNotExistException')) {
                throw new exceptions.NotFound(ResourceModel.TYPE_NAME, model.approvalRuleTemplateName);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
