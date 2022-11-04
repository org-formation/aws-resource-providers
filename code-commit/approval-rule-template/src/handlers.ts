import { AWSError, CodeCommit } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel, TemplateContent } from './models';

class Resource extends BaseResource<ResourceModel> {
    static convertToEpoch(value?: Date): number {
        if (value) {
            return value.getTime() / 1000.0;
        }
        return null;
    }

    static extractResourceId(arn: string): string {
        if (arn.length) {
            return arn.split('/').pop();
        }
        return arn;
    }

    static formatArn(region: string, awsAccountId: string, resourceId: string): string {
        if (region && awsAccountId && resourceId) {
            return `arn:community:codecommit:${region}:${awsAccountId}:approval-rule-template/${resourceId}`;
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
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, logicalResourceIdentifier, region } = args.request;

        if (model.arn) {
            throw new exceptions.InvalidRequest('Read only property [Arn] cannot be provided by the user.');
        } else if (model.id) {
            throw new exceptions.InvalidRequest('Read only property [Id] cannot be provided by the user.');
        }

        const request: CodeCommit.CreateApprovalRuleTemplateInput = {
            approvalRuleTemplateName: model.name,
            approvalRuleTemplateDescription: model.description,
            approvalRuleTemplateContent: model.content && JSON.stringify(model.content.serialize()),
        };

        try {
            args.logger.log({ action, message: 'before createApprovalRuleTemplate', request });
            const response = await service.createApprovalRuleTemplate(request).promise();
            args.logger.log({ action, message: 'after invoke createApprovalRuleTemplate', response });
            const { approvalRuleTemplateId, approvalRuleTemplateName } = response.approvalRuleTemplate;

            const result = new ResourceModel();
            result.arn = Resource.formatArn(region, awsAccountId, approvalRuleTemplateId);
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
            if (err?.code === 'ApprovalRuleTemplateNameAlreadyExistsException') {
                throw new exceptions.AlreadyExists(this.typeName, logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, logicalResourceIdentifier, previousResourceState, region } = args.request;
        const { arn, id } = previousResourceState;
        if (!model.arn && !model.id) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        } else if (model.arn !== arn) {
            args.logger.log(this.typeName, `[NEW ${model.arn}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${arn}].`);
            throw new exceptions.NotUpdatable('Read only property [Arn] cannot be updated.');
        } else if (model.id !== id) {
            args.logger.log(this.typeName, `[NEW ${model.id}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${id}].`);
            throw new exceptions.NotUpdatable('Read only property [Id] cannot be updated.');
        }
        try {
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
            }

            if (model.description !== previousResourceState.description) {
                const request: CodeCommit.UpdateApprovalRuleTemplateDescriptionInput = {
                    approvalRuleTemplateName: previousResourceState.name,
                    approvalRuleTemplateDescription: model.description,
                };
                args.logger.log({ action, message: 'before updateApprovalRuleTemplateDescription', request });
                const response = await service.updateApprovalRuleTemplateDescription(request).promise();
                args.logger.log({ action, message: 'after invoke updateApprovalRuleTemplateDescription', response });
            }

            if (model.name !== previousResourceState.name) {
                const request: CodeCommit.UpdateApprovalRuleTemplateNameInput = {
                    oldApprovalRuleTemplateName: previousResourceState.name,
                    newApprovalRuleTemplateName: model.name,
                };
                args.logger.log({ action, message: 'before invoke updateApprovalRuleTemplateName', request });
                const response = await service.updateApprovalRuleTemplateName(request).promise();
                args.logger.log({ action, message: 'after invoke updateApprovalRuleTemplateName', response });
            }

            model = await this.getRuleTemplate(service, args.logger, model.name);
            model.arn = Resource.formatArn(region, awsAccountId, model.id);

            args.logger.log({ action, message: 'done', model });
            return Promise.resolve(model);
        } catch (err) {
            if (err?.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound(this.typeName, id || logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        }
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<null> {
        const { awsAccountId, logicalResourceIdentifier, region } = args.request;
        let { arn, id, name } = model;
        if (!arn && !id && !name) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        }
        if (!arn) {
            arn = Resource.formatArn(region, awsAccountId, id);
        }
        if (!id) {
            id = Resource.extractResourceId(arn);
        }
        const rules = await this.listRuleTemplates(service, args.logger, { id, name }).catch((err: AWSError) => {
            if (err?.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound(this.typeName, id || logicalResourceIdentifier);
            } else {
                // Raise the original exception
                throw err;
            }
        });
        if (!rules.length) {
            throw new exceptions.NotFound(this.typeName, id || logicalResourceIdentifier);
        }
        name = rules[0].name;

        const request: CodeCommit.DeleteApprovalRuleTemplateInput = {
            approvalRuleTemplateName: name,
        };

        args.logger.log({ action, message: 'before invoke deleteApprovalRuleTemplate', request });
        const response = await service.deleteApprovalRuleTemplate(request).promise();
        args.logger.log({ action, message: 'after invoke deleteApprovalRuleTemplate', response });

        args.logger.log({ action, message: 'done' });

        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'CodeCommit', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit, model: ResourceModel): Promise<ResourceModel> {
        const { awsAccountId, logicalResourceIdentifier, region } = args.request;
        let { arn, id } = model;
        const name = model.name;
        if (!arn && !id && !name) {
            throw new exceptions.NotFound(this.typeName, logicalResourceIdentifier);
        }
        if (!arn) {
            arn = Resource.formatArn(region, awsAccountId, id);
        }
        if (!id) {
            id = Resource.extractResourceId(arn);
        }
        try {
            const rules = await this.listRuleTemplates(service, args.logger, { id, name });
            if (!rules.length) {
                throw new exceptions.NotFound(this.typeName, id || logicalResourceIdentifier);
            }
            const result = rules[0];
            result.arn = Resource.formatArn(region, awsAccountId, result.id);
            args.logger.log({ action, message: 'done', result });

            return Promise.resolve(result);
        } catch (err) {
            if (err?.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound(this.typeName, id || logicalResourceIdentifier);
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
