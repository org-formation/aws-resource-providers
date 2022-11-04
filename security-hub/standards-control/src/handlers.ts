import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';

import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';
import { AwsSecurityFindingIdentifier } from 'aws-sdk/clients/securityhub';

const createStandardsControlArn = (accountId: string, region: string, standardCode: string, controlId: string) => {
    if (standardCode == 'CIS') return `arn:aws:securityhub:${region}:${accountId}:control/cis-aws-foundations-benchmark/v/1.2.0/${controlId}`;
    if (standardCode == 'PCIDSS') return `arn:aws:securityhub:${region}:${accountId}:control/pci-dss/v/3.2.1/${controlId}`;
    if (standardCode == 'AFSBP') return `arn:aws:securityhub:${region}:${accountId}:control/aws-foundational-security-best-practices/v/1.0.0/${controlId}`;
    throw new Error('unknown standardCode');
};

const suppressFindingsForControlArn = async (securityHub: SecurityHub, controlArn: string) => {
    let currentPageToken: string = undefined;
    do {
        const response = await securityHub
            .getFindings({
                NextToken: currentPageToken,
                MaxResults: 100,
                Filters: {
                    WorkflowStatus: [
                        { Comparison: 'EQUALS', Value: 'NEW' },
                        { Comparison: 'EQUALS', Value: 'NOTIFIED' },
                    ],
                    RecordState: [{ Comparison: 'EQUALS', Value: 'ACTIVE' }],
                    ProductName: [{ Comparison: 'EQUALS', Value: 'Security Hub' }],
                    ProductFields: [{ Key: 'StandardsControlArn', Value: controlArn, Comparison: 'EQUALS' }],
                },
            })
            .promise();

        if (response.Findings.length) {
            const identifiers = response.Findings.map((f) => ({ Id: f.Id, ProductArn: f.ProductArn } as AwsSecurityFindingIdentifier));
            await securityHub
                .batchUpdateFindings({
                    FindingIdentifiers: identifiers,
                    Workflow: {
                        Status: 'SUPPRESSED',
                    },
                })
                .promise();
        }

        currentPageToken = response.NextToken;
    } while (currentPageToken);
};

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { standardCode, controlId, disabledReason, controlStatus, suppressCurrentFindingsOnDisabled } = model;
        const standardsControlArn = createStandardsControlArn(args.request.awsAccountId, args.request.region, standardCode, controlId);

        const request: SecurityHub.UpdateStandardsControlRequest = {
            StandardsControlArn: standardsControlArn,
            DisabledReason: disabledReason,
            ControlStatus: controlStatus,
        };

        try {
            args.logger.log({ action, message: 'before updateStandardsControl', request });
            const response = await service.updateStandardsControl(request).promise();
            args.logger.log({ action, message: 'after invoke updateStandardsControl', response });

            model.resourceId = standardsControlArn;
            args.logger.log({ action, message: 'done', model });

            if (controlStatus === 'DISABLED' && suppressCurrentFindingsOnDisabled) {
                args.logger.log({ action, message: 'suppressing findings', request });
                await suppressFindingsForControlArn(service, standardsControlArn);
            }

            return Promise.resolve(model);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const { standardCode, controlId, disabledReason, controlStatus, suppressCurrentFindingsOnDisabled } = model;
        const standardsControlArn = createStandardsControlArn(args.request.awsAccountId, args.request.region, standardCode, controlId);

        const request: SecurityHub.UpdateStandardsControlRequest = {
            StandardsControlArn: standardsControlArn,
            DisabledReason: disabledReason,
            ControlStatus: controlStatus,
        };

        try {
            args.logger.log({ action, message: 'before updateStandardsControl', request });
            const response = await service.updateStandardsControl(request).promise();
            args.logger.log({ action, message: 'after invoke updateStandardsControl', response });

            model.resourceId = standardsControlArn;
            args.logger.log({ action, message: 'done', model });

            if (controlStatus === 'DISABLED' && suppressCurrentFindingsOnDisabled) {
                args.logger.log({ action, message: 'suppressing findings', request });
                await suppressFindingsForControlArn(service, standardsControlArn);
            }
            return Promise.resolve(model);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<null> {
        return Promise.resolve(null);
    }

    @handlerEvent(Action.Read)
    @commonAws({ service: SecurityHub, debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        return Promise.resolve(model);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
