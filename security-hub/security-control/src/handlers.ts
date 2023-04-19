
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { AwsSecurityFindingIdentifier, SecurityHub } from '@aws-sdk/client-securityhub';
import { Action, BaseResource, exceptions, handlerEvent, LoggerProxy, OperationStatus, Optional, ProgressEvent, ResourceHandlerRequest, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel, TypeConfigurationModel } from './models';


const unSuppressFindingsForControlArn = async (securityHub: SecurityHub, securityControlId: string, suppressionsUpdatedBy: string = 'suppress-disabled-security-control') => {
    let currentPageToken: string = undefined;
    do {
        const response = await securityHub
            .getFindings({
                NextToken: currentPageToken,
                MaxResults: 100,
                Filters: {
                    WorkflowStatus: [{ Comparison: 'EQUALS', Value: 'SUPPRESSED' }],
                    RecordState: [{ Comparison: 'EQUALS', Value: 'ACTIVE' }],
                    ProductName: [{ Comparison: 'EQUALS', Value: 'Security Hub' }],
                    ProductFields: [{ Key: 'ComplianceSecurityControlId', Value: securityControlId, Comparison: 'EQUALS' }],
                    ...(suppressionsUpdatedBy ? { NoteUpdatedBy: [{ Comparison: 'EQUALS', Value: suppressionsUpdatedBy}] } : {}),
                },
            });

        if (response.Findings.length) {
            const identifiers = response.Findings.map((f) => ({ Id: f.Id, ProductArn: f.ProductArn } as AwsSecurityFindingIdentifier));
            await securityHub
                .batchUpdateFindings({
                    FindingIdentifiers: identifiers,
                    Note: {
                        Text: 'un-suppressed finding, as the standards control got enabled',
                        UpdatedBy: 'auto-suppress-disabled-rule',
                    },
                    Workflow: {
                        Status: 'NEW',
                    },
                });
        }

        currentPageToken = response.NextToken;
    } while (currentPageToken);
};
const suppressFindingsForControlArn = async (securityHub: SecurityHub, securityControlId: string, suppressionsUpdatedBy: string = 'suppress-disabled-security-control') => {
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
                    ProductFields: [{ Key: 'ComplianceSecurityControlId', Value: securityControlId, Comparison: 'EQUALS' }],
                },
            });

        if (response.Findings.length) {
            const identifiers = response.Findings.map((f) => ({ Id: f.Id, ProductArn: f.ProductArn } as AwsSecurityFindingIdentifier));
            await securityHub
                .batchUpdateFindings({
                    FindingIdentifiers: identifiers,
                    Note: {
                        Text: 'suppressing finding, as the security control got disabled',
                        UpdatedBy: suppressionsUpdatedBy,
                    },
                    Workflow: {
                        Status: 'SUPPRESSED',
                    },
                });
        }

        currentPageToken = response.NextToken;
    } while (currentPageToken);
};


interface CallbackContext extends Record<string, any> {
}

class Resource extends BaseResource<ResourceModel> {

    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = request.desiredResourceState;
        const action = "Create";
        const { controlId, disabledReason, controlStatus, suppressCurrentFindingsOnDisabled } = request.desiredResourceState;


        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);
        try {
            const client = new SecurityHub((session as any).options);
            logger.log({ action, message: 'before invoke listStandardsControlAssociations', controlId });
            const associations = await client.listStandardsControlAssociations({ SecurityControlId: controlId });
            logger.log({ action, message: 'after invoke listStandardsControlAssociations', associations });
            const StandardsControlAssociationUpdates = associations.StandardsControlAssociationSummaries.map(x => ({
                SecurityControlId: x.SecurityControlId,
                StandardsArn: x.StandardsArn,
                AssociationStatus: controlStatus,
                ...(controlStatus === "DISABLED" ? { UpdatedReason: disabledReason } : {}),
            }));

            if (StandardsControlAssociationUpdates.length > 0) {
                
                logger.log({ action, message: 'before invoke batchUpdateStandardsControlAssociations', StandardsControlAssociationUpdates });
                const response = await client.batchUpdateStandardsControlAssociations({
                    StandardsControlAssociationUpdates
                });
                logger.log({ action, message: 'after invoke batchUpdateStandardsControlAssociations', response });

                if (controlStatus === 'DISABLED' && suppressCurrentFindingsOnDisabled) {
                    logger.log({ action, message: 'suppressing findings', request });
                    await suppressFindingsForControlArn(client, controlId, model.suppressionsUpdatedBy);
                }
            }
            progress.status = OperationStatus.Success
            return progress;
        } catch (err) {
            logger.log(err);
            progress.status = OperationStatus.Failed;
            return progress;
        }
    }

    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>>
    {
        const model = request.desiredResourceState;
        const action = "Update";
        const { controlId, disabledReason, controlStatus, suppressCurrentFindingsOnDisabled } = request.desiredResourceState;
        const previousControlStatus = request.previousResourceState.controlStatus;


        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);
        try {
            const client = new SecurityHub((session as any).options);
            logger.log({ action, message: 'before invoke listStandardsControlAssociations', controlId });
            const associations = await client.listStandardsControlAssociations({ SecurityControlId: controlId });
            logger.log({ action, message: 'after invoke listStandardsControlAssociations', associations });
            const StandardsControlAssociationUpdates = associations.StandardsControlAssociationSummaries.map(x => ({
                SecurityControlId: x.SecurityControlId,
                StandardsArn: x.StandardsArn,
                AssociationStatus: controlStatus,
                ...(controlStatus === "DISABLED" ? { UpdatedReason: disabledReason } : {}),
            }));


            if (StandardsControlAssociationUpdates.length > 0) {
                logger.log({ action, message: 'before invoke batchUpdateStandardsControlAssociations', StandardsControlAssociationUpdates });
                const response = await client.batchUpdateStandardsControlAssociations({
                    StandardsControlAssociationUpdates
                });
                logger.log({ action, message: 'after invoke batchUpdateStandardsControlAssociations', response });

                if (controlStatus === 'DISABLED' && previousControlStatus === 'ENABLED' && suppressCurrentFindingsOnDisabled) {
                    logger.log({ action, message: 'suppressing findings', request });
                    await suppressFindingsForControlArn(client, controlId, model.suppressionsUpdatedBy);
                } else if (controlStatus === 'ENABLED' && previousControlStatus === 'DISABLED') {
                    logger.log({ action, message: 'un-suppressing findings', request });
                    await unSuppressFindingsForControlArn(client, controlId, model.suppressionsUpdatedBy);
                }

                if (controlStatus === 'DISABLED' && suppressCurrentFindingsOnDisabled) {
                    logger.log({ action, message: 'suppressing findings', request });
                    await suppressFindingsForControlArn(client, controlId, model.suppressionsUpdatedBy);
                }
            }
            progress.status = OperationStatus.Success;
        } catch (err) {
            logger.log(err);
            progress.status = OperationStatus.Failed;
        }
        return progress;
    }

    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {

        const model = request.desiredResourceState;
        const action = "Delete";
        const { controlId } = request.desiredResourceState;


        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model, callbackContext);
        try {
            const client = new SecurityHub((session as any).options);
            logger.log({ action, message: 'before invoke listStandardsControlAssociations', controlId });
            const associations = await client.listStandardsControlAssociations({ SecurityControlId: controlId });
            logger.log({ action, message: 'after invoke listStandardsControlAssociations', associations });
            const StandardsControlAssociationUpdates = associations.StandardsControlAssociationSummaries.map(x => ({
                SecurityControlId: x.SecurityControlId,
                StandardsArn: x.StandardsArn,
                AssociationStatus: "ENABLED",
            }));


            if (StandardsControlAssociationUpdates.length > 0) {
                logger.log({ action, message: 'before invoke batchUpdateStandardsControlAssociations', StandardsControlAssociationUpdates });
                const response = await client.batchUpdateStandardsControlAssociations({
                    StandardsControlAssociationUpdates
                });
                logger.log({ action, message: 'after invoke batchUpdateStandardsControlAssociations', response });
                logger.log({ action, message: 'un-suppressing findings', request });
                await unSuppressFindingsForControlArn(client, controlId, model.suppressionsUpdatedBy);
                logger.log({ action, message: 'after un-suppressing findings', request });
            }
            progress.status = OperationStatus.Success;
        } catch (err) {
            logger.log(err);
            progress.status = OperationStatus.Failed;
        }
        return progress;
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
