import { CodeCommit } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel, TemplateContent } from './models';

class Resource extends BaseResource<ResourceModel> {
    static convertToEpoch(value?: Date): number {
        if (value) {
            return value.getTime() / 1000.0;
        }
        return null;
    }

    private async getRuleTemplate(service: CodeCommit, approvalRuleTemplateName: string): Promise<ResourceModel> {
        const request: CodeCommit.GetApprovalRuleTemplateInput = {
            approvalRuleTemplateName,
        };

        console.info({ message: 'before invoke getApprovalRuleTemplate', request });
        const response = await service.getApprovalRuleTemplate(request).promise();
        console.info({ message: 'after invoke getApprovalRuleTemplate', response });
        const { approvalRuleTemplateId, approvalRuleTemplateContent } = response.approvalRuleTemplate;

        const model = new ResourceModel();
        model.approvalRuleTemplateId = approvalRuleTemplateId;
        model.approvalRuleTemplateName = approvalRuleTemplateName;
        model.approvalRuleTemplateDescription = response.approvalRuleTemplate.approvalRuleTemplateDescription;
        model.creationDate = Resource.convertToEpoch(response.approvalRuleTemplate.creationDate);
        model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
        model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
        model.ruleContentSha256 = response.approvalRuleTemplate.ruleContentSha256;
        model.approvalRuleTemplateContent = approvalRuleTemplateContent && TemplateContent.deserialize(JSON.parse(approvalRuleTemplateContent));

        return Promise.resolve(model);
    }

    private async listRuleTemplates(service: CodeCommit, filter?: Pick<ResourceModel, 'approvalRuleTemplateId' | 'approvalRuleTemplateName'>): Promise<ResourceModel[]> {
        let rules: ResourceModel[] = [];
        if (service) {
            console.info({ message: 'before invoke listApprovalRuleTemplates' });
            const response = await service.listApprovalRuleTemplates().promise();
            console.info({ message: 'after invoke listApprovalRuleTemplates', response });
            rules = await Promise.all(
                response.approvalRuleTemplateNames.map((approvalRuleTemplateName: string) => {
                    return this.getRuleTemplate(service, approvalRuleTemplateName);
                })
            );
            if (filter) {
                return rules.filter((rule: ResourceModel) => {
                    return (
                        (filter.approvalRuleTemplateId && filter.approvalRuleTemplateId === rule.approvalRuleTemplateId) ||
                        (filter.approvalRuleTemplateName && filter.approvalRuleTemplateName === rule.approvalRuleTemplateName)
                    );
                });
            }
        }
        return Promise.resolve(rules);
    }

    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        console.info(args.request);
        const { desiredResourceState, logicalResourceIdentifier } = args.request;

        const request: CodeCommit.CreateApprovalRuleTemplateInput = {
            approvalRuleTemplateName: desiredResourceState.approvalRuleTemplateName,
            approvalRuleTemplateDescription: desiredResourceState.approvalRuleTemplateDescription,
            approvalRuleTemplateContent: desiredResourceState.approvalRuleTemplateContent && JSON.stringify(desiredResourceState.approvalRuleTemplateContent.serialize()),
        };

        console.info({ action, message: 'before createApprovalRuleTemplate', request });
        try {
            const response = await service.createApprovalRuleTemplate(request).promise();
            console.info({ action, message: 'after invoke createApprovalRuleTemplate', response });
            const { approvalRuleTemplateId, approvalRuleTemplateName } = response.approvalRuleTemplate;

            const model = new ResourceModel();
            model.approvalRuleTemplateId = approvalRuleTemplateId;
            model.approvalRuleTemplateName = approvalRuleTemplateName;
            model.approvalRuleTemplateDescription = response.approvalRuleTemplate.approvalRuleTemplateDescription;
            model.approvalRuleTemplateContent = desiredResourceState.approvalRuleTemplateContent;
            model.creationDate = Resource.convertToEpoch(response.approvalRuleTemplate.creationDate);
            model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
            model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
            model.ruleContentSha256 = response.approvalRuleTemplate.ruleContentSha256;

            console.info({ action, message: 'done', model });
            return Promise.resolve(model);
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
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        const { desiredResourceState, previousResourceState } = args.request;
        const model = desiredResourceState;
        const serializedContent = model.approvalRuleTemplateContent && model.approvalRuleTemplateContent.serialize();
        if (serializedContent !== previousResourceState.approvalRuleTemplateContent.serialize()) {
            const request: CodeCommit.UpdateApprovalRuleTemplateContentInput = {
                approvalRuleTemplateName: previousResourceState.approvalRuleTemplateName,
                // existingRuleContentSha256: previousResourceState.ruleContentSha256, # Removing because this will only succeed if content has been modified by CFN
                newRuleContent: JSON.stringify(serializedContent),
            };
            console.info({ action, message: 'before updateApprovalRuleTemplateContent', request });
            const response = await service.updateApprovalRuleTemplateContent(request).promise();
            console.info({ action, message: 'after invoke updateApprovalRuleTemplateContent', response });

            model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
            model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
            model.ruleContentSha256 = response.approvalRuleTemplate.ruleContentSha256;
        }

        if (model.approvalRuleTemplateDescription !== previousResourceState.approvalRuleTemplateDescription) {
            const request: CodeCommit.UpdateApprovalRuleTemplateDescriptionInput = {
                approvalRuleTemplateName: previousResourceState.approvalRuleTemplateName,
                approvalRuleTemplateDescription: model.approvalRuleTemplateDescription,
            };
            console.info({ action, message: 'before updateApprovalRuleTemplateDescription', request });
            const response = await service.updateApprovalRuleTemplateDescription(request).promise();
            console.info({ action, message: 'after invoke updateApprovalRuleTemplateDescription', response });

            model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
            model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
        }

        if (model.approvalRuleTemplateName !== previousResourceState.approvalRuleTemplateName) {
            const request: CodeCommit.UpdateApprovalRuleTemplateNameInput = {
                oldApprovalRuleTemplateName: previousResourceState.approvalRuleTemplateName,
                newApprovalRuleTemplateName: model.approvalRuleTemplateName,
            };
            console.info({ action, message: 'before invoke updateApprovalRuleTemplateName', request });
            const response = await service.updateApprovalRuleTemplateName(request).promise();
            console.info({ action, message: 'after invoke updateApprovalRuleTemplateName', response });

            model.lastModifiedDate = Resource.convertToEpoch(response.approvalRuleTemplate.lastModifiedDate);
            model.lastModifiedUser = response.approvalRuleTemplate.lastModifiedUser;
        }

        if (!model.creationDate) {
            model.creationDate = previousResourceState.creationDate;
        }

        console.info({ action, message: 'done', model });
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<null> {
        const { desiredResourceState } = args.request;

        let approvalRuleTemplateName = desiredResourceState.approvalRuleTemplateName;

        if (!approvalRuleTemplateName) {
            const rules = await this.listRuleTemplates(service, {
                approvalRuleTemplateId: desiredResourceState.approvalRuleTemplateId,
            });
            approvalRuleTemplateName = rules[0].approvalRuleTemplateName;
        }

        const request: CodeCommit.DeleteApprovalRuleTemplateInput = {
            approvalRuleTemplateName,
        };

        console.info({ action, message: 'before invoke deleteApprovalRuleTemplate', request });
        const response = await service.deleteApprovalRuleTemplate(request).promise();
        console.info({ action, message: 'after invoke deleteApprovalRuleTemplate', response });

        console.info({ action, message: 'done' });

        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;
        const { approvalRuleTemplateName, approvalRuleTemplateId } = desiredResourceState;

        if (!approvalRuleTemplateName && !approvalRuleTemplateId) {
            throw new exceptions.NotFound(ResourceModel.TYPE_NAME, logicalResourceIdentifier);
        }
        try {
            const rules = await this.listRuleTemplates(service, {
                approvalRuleTemplateId,
                approvalRuleTemplateName,
            });
            const model = rules[0];
            console.info({ action, message: 'done', model });

            return Promise.resolve(model);
        } catch (err) {
            if (err && err.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound(ResourceModel.TYPE_NAME, approvalRuleTemplateId || logicalResourceIdentifier);
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
