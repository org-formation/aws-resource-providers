import { CodeCommit } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from 'cfn-rpdk';
import { ResourceModel, TemplateContent } from './models';

class Resource extends BaseResource<ResourceModel> {
    static convertToEpoch(value?: Date): number {
        if (value) {
            return value.getTime() / 1000.0;
        }
        return null;
    }

    private async getRuleTemplate(service: CodeCommit, logger: Logger, approvalRuleTemplateName: string): Promise<ResourceModel> {
        const request: CodeCommit.GetApprovalRuleTemplateInput = {
            approvalRuleTemplateName,
        };

        logger.log({ message: 'before invoke getApprovalRuleTemplate', request });
        const response = await service.getApprovalRuleTemplate(request).promise();
        logger.log({ message: 'after invoke getApprovalRuleTemplate', response });
        const { approvalRuleTemplateId, approvalRuleTemplateContent } = response.approvalRuleTemplate;

        const model = new ResourceModel();
        model.id = approvalRuleTemplateId;
        model.name = approvalRuleTemplateName;
        model.description = response.approvalRuleTemplate.approvalRuleTemplateDescription;
        model.creationDate = Resource.convertToEpoch(response.approvalRuleTemplate.creationDate);
        model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
        model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
        model.ruleContentSha256 = response.approvalRuleTemplate.ruleContentSha256;
        model.content = approvalRuleTemplateContent && TemplateContent.deserialize(JSON.parse(approvalRuleTemplateContent));

        return Promise.resolve(model);
    }

    private async listRuleTemplates(service: CodeCommit, logger: Logger, filter?: Pick<ResourceModel, 'id' | 'name'>): Promise<ResourceModel[]> {
        let rules: ResourceModel[] = [];
        if (service) {
            logger.log({ message: 'before invoke listApprovalRuleTemplates' });
            const response = await service.listApprovalRuleTemplates().promise();
            logger.log({ message: 'after invoke listApprovalRuleTemplates', response });
            rules = await Promise.all(
                response.approvalRuleTemplateNames.map((approvalRuleTemplateName: string) => {
                    return this.getRuleTemplate(service, logger, approvalRuleTemplateName);
                })
            );
            if (filter) {
                return rules.filter((rule: ResourceModel) => {
                    return (filter.id && filter.id === rule.id) || (filter.name && filter.name === rule.name);
                });
            }
        }
        return Promise.resolve(rules);
    }

    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'CodeCommit', debug: false })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        args.logger.log(args.request);
        const { logicalResourceIdentifier } = args.request;

        const request: CodeCommit.CreateApprovalRuleTemplateInput = {
            approvalRuleTemplateName: model.name,
            approvalRuleTemplateDescription: model.description,
            approvalRuleTemplateContent: model.content && JSON.stringify(model.content.serialize()),
        };

        args.logger.log({ action, message: 'before createApprovalRuleTemplate', request });
        try {
            const response = await service.createApprovalRuleTemplate(request).promise();
            args.logger.log({ action, message: 'after invoke createApprovalRuleTemplate', response });
            const { approvalRuleTemplateId, approvalRuleTemplateName } = response.approvalRuleTemplate;

            const result = new ResourceModel();
            result.id = approvalRuleTemplateId;
            result.name = approvalRuleTemplateName;
            result.description = response.approvalRuleTemplate.approvalRuleTemplateDescription;
            result.content = model.content;
            result.creationDate = Resource.convertToEpoch(response.approvalRuleTemplate.creationDate);
            result.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
            result.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
            result.ruleContentSha256 = response.approvalRuleTemplate.ruleContentSha256;

            args.logger.log({ action, message: 'done', result });
            return Promise.resolve(result);
        } catch (err) {
            console.log(err);
            if (err && err.code === 'ApprovalRuleTemplateNameAlreadyExistsException') {
                throw new exceptions.AlreadyExists(ResourceModel.TYPE_NAME, logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'CodeCommit', debug: false })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { previousResourceState } = args.request;
        const serializedContent = model.content && model.content.serialize();
        if (serializedContent !== previousResourceState.content.serialize()) {
            const request: CodeCommit.UpdateApprovalRuleTemplateContentInput = {
                approvalRuleTemplateName: previousResourceState.name,
                // existingRuleContentSha256: previousResourceState.ruleContentSha256, # Removing because this will only succeed if content has been modified by CFN
                newRuleContent: JSON.stringify(serializedContent),
            };
            args.logger.log({ action, message: 'before updateApprovalRuleTemplateContent', request });
            const response = await service.updateApprovalRuleTemplateContent(request).promise();
            args.logger.log({ action, message: 'after invoke updateApprovalRuleTemplateContent', response });

            model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
            model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
            model.ruleContentSha256 = response.approvalRuleTemplate.ruleContentSha256;
        }

        if (model.description !== previousResourceState.description) {
            const request: CodeCommit.UpdateApprovalRuleTemplateDescriptionInput = {
                approvalRuleTemplateName: previousResourceState.name,
                approvalRuleTemplateDescription: model.description,
            };
            args.logger.log({ action, message: 'before updateApprovalRuleTemplateDescription', request });
            const response = await service.updateApprovalRuleTemplateDescription(request).promise();
            args.logger.log({ action, message: 'after invoke updateApprovalRuleTemplateDescription', response });

            model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
            model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
        }

        if (model.name !== previousResourceState.name) {
            const request: CodeCommit.UpdateApprovalRuleTemplateNameInput = {
                oldApprovalRuleTemplateName: previousResourceState.name,
                newApprovalRuleTemplateName: model.name,
            };
            args.logger.log({ action, message: 'before invoke updateApprovalRuleTemplateName', request });
            const response = await service.updateApprovalRuleTemplateName(request).promise();
            args.logger.log({ action, message: 'after invoke updateApprovalRuleTemplateName', response });

            model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
            model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
        }

        if (!model.creationDate) {
            model.creationDate = previousResourceState.creationDate;
        }

        args.logger.log({ action, message: 'done', model });
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'CodeCommit', debug: false })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<null> {
        let approvalRuleTemplateName = model.name;

        if (!approvalRuleTemplateName) {
            const rules = await this.listRuleTemplates(service, args.logger, {
                id: model.id,
            });
            approvalRuleTemplateName = rules[0].name;
        }

        const request: CodeCommit.DeleteApprovalRuleTemplateInput = {
            approvalRuleTemplateName,
        };

        args.logger.log({ action, message: 'before invoke deleteApprovalRuleTemplate', request });
        const response = await service.deleteApprovalRuleTemplate(request).promise();
        args.logger.log({ action, message: 'after invoke deleteApprovalRuleTemplate', response });

        args.logger.log({ action, message: 'done' });

        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'CodeCommit', debug: false })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { logicalResourceIdentifier } = args.request;
        const { name, id } = model;

        if (!name && !id) {
            throw new exceptions.NotFound(ResourceModel.TYPE_NAME, logicalResourceIdentifier);
        }
        try {
            const rules = await this.listRuleTemplates(service, args.logger, {
                id,
                name,
            });
            const result = rules[0];
            args.logger.log({ action, message: 'done', result });

            return Promise.resolve(result);
        } catch (err) {
            if (err && err.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound(ResourceModel.TYPE_NAME, id || logicalResourceIdentifier);
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
