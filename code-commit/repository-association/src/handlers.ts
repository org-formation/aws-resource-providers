import { AWSError, CodeCommit, Response } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';

type CodeCommitBatchOutput = CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesOutput | CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesOutput;
type CodeCommitBatchResponse = CodeCommitBatchOutput & { $response?: Response<CodeCommitBatchOutput, AWSError> };
interface Filter {
    id?: string;
    name?: string;
}

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

    private async getRuleTemplate(service: CodeCommit, logger: Logger, filter: Filter): Promise<CodeCommit.ApprovalRuleTemplate> {
        logger.log({ message: 'before invoke listApprovalRuleTemplates' });
        const response = await service.listApprovalRuleTemplates().promise();
        logger.log({ message: 'after invoke listApprovalRuleTemplates', response });
        const rules: CodeCommit.ApprovalRuleTemplate[] = [];
        for (const approvalRuleTemplateName of response.approvalRuleTemplateNames) {
            const request: CodeCommit.GetApprovalRuleTemplateInput = {
                approvalRuleTemplateName,
            };
            logger.log({ message: 'before invoke getApprovalRuleTemplate', request });
            const response = await service.getApprovalRuleTemplate(request).promise();
            logger.log({ message: 'after invoke getApprovalRuleTemplate', response });
            rules.push(response.approvalRuleTemplate || {});
        }
        const approvalRuleTemplate = rules.find((approvalRuleTemplate: CodeCommit.ApprovalRuleTemplate) => {
            return (filter.id && filter.id === approvalRuleTemplate.approvalRuleTemplateId) || (filter.name && filter.name === approvalRuleTemplate.approvalRuleTemplateName);
        });
        if (!approvalRuleTemplate) {
            throw new exceptions.NotFound('ApprovalRuleTemplate', filter.id || filter.name);
        }
        return Promise.resolve(approvalRuleTemplate);
    }

    private async listRepositoryAssociations(service: CodeCommit, logger: Logger, model: ResourceModel): Promise<ResourceModel> {
        const request: CodeCommit.ListRepositoriesForApprovalRuleTemplateInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
        };
        try {
            logger.log({ message: 'before invoke listRepositoriesForApprovalRuleTemplate', request });
            const response = await service.listRepositoriesForApprovalRuleTemplate(request).promise();
            logger.log({ message: 'after invoke listRepositoriesForApprovalRuleTemplate', response });
            const result = new ResourceModel();
            result.approvalRuleTemplateArn = model.approvalRuleTemplateArn;
            result.approvalRuleTemplateName = model.approvalRuleTemplateName;
            result.repositoryNames = response.repositoryNames;
            result.arn = model.arn;

            return Promise.resolve(result);
        } catch (err) {
            if (err?.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound('ApprovalRuleTemplateName', model.approvalRuleTemplateName);
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
        let approvalRuleTemplateId: string;
        if (model.arn) {
            throw new exceptions.InvalidRequest('Read only property [Arn] cannot be provided by the user.');
        }
        if (model.approvalRuleTemplateArn) {
            approvalRuleTemplateId = Resource.extractResourceId(model.approvalRuleTemplateArn);
            const approvalRuleTemplate = await this.getRuleTemplate(service, args.logger, { id: approvalRuleTemplateId });
            model.approvalRuleTemplateName = approvalRuleTemplate.approvalRuleTemplateName;
        } else {
            const approvalRuleTemplate = await this.getRuleTemplate(service, args.logger, { name: model.approvalRuleTemplateName });
            approvalRuleTemplateId = approvalRuleTemplate.approvalRuleTemplateId;
        }

        await this.listRepositoryAssociations(service, args.logger, model)
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
        model.arn = Resource.formatArn(region, awsAccountId, approvalRuleTemplateId);

        args.logger.log({ action, message: 'done', model });
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { logicalResourceIdentifier, previousResourceState } = args.request;
        const { approvalRuleTemplateArn, approvalRuleTemplateName, arn } = previousResourceState;
        if (!model.arn) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        } else if (model.arn !== arn) {
            args.logger.log(this.typeName, `[NEW ${model.arn}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${arn}].`);
            throw new exceptions.NotUpdatable('Read only property [Arn] cannot be updated.');
        } else if (model.approvalRuleTemplateArn && model.approvalRuleTemplateArn !== approvalRuleTemplateArn) {
            args.logger.log(this.typeName, `[NEW ${model.approvalRuleTemplateArn}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${approvalRuleTemplateArn}].`);
            throw new exceptions.NotUpdatable('Create only property [ApprovalRuleTemplateArn] cannot be updated.');
        } else if (model.approvalRuleTemplateName && model.approvalRuleTemplateName !== approvalRuleTemplateName) {
            args.logger.log(
                this.typeName,
                `[NEW ${model.approvalRuleTemplateName}] [${logicalResourceIdentifier}]`,
                `does not match identifier from saved resource [OLD ${approvalRuleTemplateName}].`
            );
            throw new exceptions.NotUpdatable('Create only property [ApprovalRuleTemplateName] cannot be updated.');
        }
        const approvalRuleTemplateId = Resource.extractResourceId(arn);
        const approvalRuleTemplate = await this.getRuleTemplate(service, args.logger, { id: approvalRuleTemplateId });
        model.approvalRuleTemplateName = approvalRuleTemplate.approvalRuleTemplateName;

        const result = await this.listRepositoryAssociations(service, args.logger, model);
        if (!result.repositoryNames?.length) {
            throw new exceptions.NotFound(this.typeName, model.approvalRuleTemplateName);
        }

        // First disassociate all repositories from previous state for the rule name
        const requestRemoval: CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
            repositoryNames: previousResourceState.repositoryNames,
        };
        args.logger.log({ action, message: 'before batchDisassociateApprovalRuleTemplateFromRepositories', requestRemoval });
        const responseRemoval = await service.batchDisassociateApprovalRuleTemplateFromRepositories(requestRemoval).promise();
        args.logger.log({ action, message: 'after invoke batchDisassociateApprovalRuleTemplateFromRepositories', responseRemoval });
        await this.checkBatchResponse(responseRemoval, args.logger);

        // Then associate repositories from desired state to the rule name
        const request: CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
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
        const { logicalResourceIdentifier } = args.request;
        const { arn } = model;
        if (!arn) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        }
        const approvalRuleTemplateId = Resource.extractResourceId(arn);
        const approvalRuleTemplate = await this.getRuleTemplate(service, args.logger, { id: approvalRuleTemplateId });
        model.approvalRuleTemplateName = approvalRuleTemplate.approvalRuleTemplateName;

        const result = await this.listRepositoryAssociations(service, args.logger, model);
        if (!result.repositoryNames?.length) {
            throw new exceptions.NotFound(this.typeName, model.approvalRuleTemplateName);
        }
        const request: CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
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
        const { logicalResourceIdentifier } = args.request;
        const { arn } = model;
        if (!arn) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        }
        const approvalRuleTemplateId = Resource.extractResourceId(arn);
        const approvalRuleTemplate = await this.getRuleTemplate(service, args.logger, { id: approvalRuleTemplateId });
        model.approvalRuleTemplateName = approvalRuleTemplate.approvalRuleTemplateName;

        const result = await this.listRepositoryAssociations(service, args.logger, model);
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
