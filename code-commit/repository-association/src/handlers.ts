import { CodeCommit } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        const { awsAccountId, desiredResourceState } = args.request;
        const model = desiredResourceState;

        const request: CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesInput = {
            approvalRuleTemplateName: model.approvalRuleTemplateName,
            repositoryNames: model.repositoryNames,
        };

        console.info({ action, message: 'after batchAssociateApprovalRuleTemplateWithRepositories', request });
        const response = await service.batchAssociateApprovalRuleTemplateWithRepositories(request).promise();
        console.info({ action, message: 'after invoke batchAssociateApprovalRuleTemplateWithRepositories', response });

        model.arn = `arn:community:codecommit::${awsAccountId}:repository-association/${model.approvalRuleTemplateName}`;

        console.info({ action, message: 'done', model });
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        const { desiredResourceState, previousResourceState } = args.request;
        const model = desiredResourceState;

        let added = desiredResourceState.repositoryNames;
        let deleted = previousResourceState.repositoryNames;
        if (desiredResourceState.approvalRuleTemplateName == previousResourceState.approvalRuleTemplateName) {
            added = desiredResourceState.repositoryNames.filter((element: string) => {
                return !previousResourceState.repositoryNames.includes(element);
            });
            deleted = previousResourceState.repositoryNames.filter((element: string) => {
                return !desiredResourceState.repositoryNames.includes(element);
            });
        }
        if (added.length > 0) {
            const request: CodeCommit.BatchAssociateApprovalRuleTemplateWithRepositoriesInput = {
                approvalRuleTemplateName: desiredResourceState.approvalRuleTemplateName,
                repositoryNames: added,
            };
            console.info({ action, message: 'after batchAssociateApprovalRuleTemplateWithRepositories', request });
            const response = await service.batchAssociateApprovalRuleTemplateWithRepositories(request).promise();
            console.info({ action, message: 'after invoke batchAssociateApprovalRuleTemplateWithRepositories', response });
        }
        if (deleted.length > 0) {
            const request: CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesInput = {
                approvalRuleTemplateName: previousResourceState.approvalRuleTemplateName,
                repositoryNames: deleted,
            };
            console.info({ action, message: 'after batchDisassociateApprovalRuleTemplateFromRepositories', request });
            const response = await service.batchDisassociateApprovalRuleTemplateFromRepositories(request).promise();
            console.info({ action, message: 'after invoke batchDisassociateApprovalRuleTemplateFromRepositories', response });
        }

        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<null> {
        const { desiredResourceState } = args.request;
        const request: CodeCommit.BatchDisassociateApprovalRuleTemplateFromRepositoriesInput = {
            approvalRuleTemplateName: desiredResourceState.approvalRuleTemplateName,
            repositoryNames: desiredResourceState.repositoryNames,
        };

        console.info({ action, message: 'after invoke batchDisassociateApprovalRuleTemplateFromRepositories', request });
        const response = await service.batchDisassociateApprovalRuleTemplateFromRepositories(request).promise();
        console.info({ action, message: 'after invoke batchDisassociateApprovalRuleTemplateFromRepositories', response });

        console.info({ action, message: 'done' });
        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        const { desiredResourceState } = args.request;

        const request: CodeCommit.ListRepositoriesForApprovalRuleTemplateInput = {
            approvalRuleTemplateName: desiredResourceState.approvalRuleTemplateName,
        };

        console.info({ action, message: 'after invoke listRepositoriesForApprovalRuleTemplate', request });
        try {
            const response = await service.listRepositoriesForApprovalRuleTemplate(request).promise();
            console.info({ action, message: 'after invoke listRepositoriesForApprovalRuleTemplate', response });

            const result = new ResourceModel();
            result.approvalRuleTemplateName = desiredResourceState.approvalRuleTemplateName;
            result.repositoryNames = response.repositoryNames;
            result.arn = desiredResourceState.arn;

            console.info({ action, message: 'done', result });

            return Promise.resolve(result);
        } catch (err) {
            if (err && err.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound(ResourceModel.TYPE_NAME, desiredResourceState.approvalRuleTemplateName);
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
