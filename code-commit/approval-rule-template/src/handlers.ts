import { CodeCommit } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({
        serviceName: 'CodeCommit',
        debug: true,
    })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        const { desiredResourceState } = args.request;

        const request: CodeCommit.CreateApprovalRuleTemplateInput = {
            approvalRuleTemplateName: desiredResourceState.approvalRuleTemplateName,
            approvalRuleTemplateDescription: desiredResourceState.approvalRuleTemplateDescription,
            approvalRuleTemplateContent: JSON.stringify(desiredResourceState.approvalRuleTemplateContent),
        };

        console.info({
            action,
            message: 'before invoke createApprovalRuleTemplate',
            request,
        });
        const response = await service.createApprovalRuleTemplate(request).promise();
        console.info({
            action,
            message: 'after invoke createApprovalRuleTemplate',
            response,
        });

        const result = ResourceModel.deserialize(response.approvalRuleTemplate);
        result.approvalRuleTemplateContent = desiredResourceState.approvalRuleTemplateContent;

        console.info({ action, message: 'done', result });
        return result;
    }

    @handlerEvent(Action.Update)
    @commonAws({
        serviceName: 'CodeCommit',
        debug: true,
    })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        const { desiredResourceState, previousResourceState } = args.request;
        const model = desiredResourceState;

        if (model.approvalRuleTemplateName !== previousResourceState.approvalRuleTemplateName) {
            const request: CodeCommit.UpdateApprovalRuleTemplateNameInput = {
                oldApprovalRuleTemplateName: previousResourceState.approvalRuleTemplateName,
                newApprovalRuleTemplateName: model.approvalRuleTemplateName,
            };
            console.info({
                action,
                message: 'before invoke updateApprovalRuleTemplateName',
                request,
            });
            const response = await service.updateApprovalRuleTemplateName(request).promise();
            console.info({
                action,
                message: 'after invoke updateApprovalRuleTemplateName',
                response,
            });
        }

        if (model.approvalRuleTemplateDescription !== previousResourceState.approvalRuleTemplateDescription) {
            const request: CodeCommit.UpdateApprovalRuleTemplateDescriptionInput = {
                approvalRuleTemplateName: model.approvalRuleTemplateName,
                approvalRuleTemplateDescription: model.approvalRuleTemplateDescription,
            };
            console.info({
                action,
                message: 'before invoke updateApprovalRuleTemplateDescription',
                request,
            });
            const response = await service.updateApprovalRuleTemplateDescription(request).promise();
            console.info({
                action,
                message: 'after invoke updateApprovalRuleTemplateDescription',
                response,
            });
        }

        if (model.approvalRuleTemplateContent !== previousResourceState.approvalRuleTemplateContent) {
            const request: CodeCommit.UpdateApprovalRuleTemplateContentInput = {
                approvalRuleTemplateName: model.approvalRuleTemplateName,
                existingRuleContentSha256: model.ruleContentSha256,
                newRuleContent: JSON.stringify(model.approvalRuleTemplateContent),
            };
            console.info({
                action,
                message: 'before invoke updateApprovalRuleTemplateContent',
                request,
            });
            const response = await service.updateApprovalRuleTemplateContent(request).promise();
            console.info({
                action,
                message: 'after invoke updateApprovalRuleTemplateContent',
                response,
            });
        }

        console.info({ action, message: 'done', model });
        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({
        serviceName: 'CodeCommit',
        debug: true,
    })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<null> {
        const { desiredResourceState } = args.request;

        const request: CodeCommit.DeleteApprovalRuleTemplateInput = {
            approvalRuleTemplateName: desiredResourceState.approvalRuleTemplateName,
        };

        console.info({
            action,
            message: 'before invoke deleteApprovalRuleTemplate',
            request,
        });
        const response = await service.deleteApprovalRuleTemplate(request).promise();
        console.info({
            action,
            message: 'after invoke deleteApprovalRuleTemplate',
            response,
        });

        console.info({ action, message: 'done' });

        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({
        serviceName: 'CodeCommit',
        debug: true,
    })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: CodeCommit): Promise<ResourceModel> {
        const { desiredResourceState } = args.request;

        const request: CodeCommit.GetApprovalRuleTemplateInput = {
            approvalRuleTemplateName: desiredResourceState.approvalRuleTemplateName,
        };

        console.info({
            action,
            message: 'before invoke getPublicAccessBlock',
            request,
        });
        try {
            const response = await service.getApprovalRuleTemplate(request).promise();
            console.info({
                action,
                message: 'after invoke getPublicAccessBlock',
                response,
            });

            const approvalRuleTemplate = response.approvalRuleTemplate;

            const result = ResourceModel.deserialize(approvalRuleTemplate);

            console.info({ action, message: 'done', result });

            return Promise.resolve(result);
        } catch (err) {
            if (err && err.code === 'ApprovalRuleTemplateDoesNotExistException') {
                throw new exceptions.NotFound(ResourceModel.TYPE_NAME, desiredResourceState.approvalRuleTemplateId);
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
