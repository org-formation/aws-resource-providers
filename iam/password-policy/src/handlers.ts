import { config, IAM } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import {
    Action,
    BaseResource,
    Dict,
    exceptions,
    handlerEvent,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from 'cfn-rpdk';

import { ResourceModel } from './models';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

/*
// The following can be used for debugging AWS SDK
config.logger = LOGGER;
Error.stackTraceLimit = Infinity;
*/

export class PasswordPolicy extends ResourceModel {
    readonly resourceId?: Optional<string>;
    readonly expirePasswords?: Optional<boolean>;
}

export class Resource extends BaseResource<ResourceModel> {
    /**
     * Retrieves the password policy for the AWS account.
     *
     * @param session Current AWS session passed through from caller
     * @param logicalResourceId The logical name of the resource as specified
     * in the template
     * @param resourceId The resource unique identifier
     * @param request The current state for the password policy
     */
    private async retrievePasswordPolicy(
        session: SessionProxy,
        logicalResourceId?: string,
        resourceId?: string,
        request?: PasswordPolicy
    ): Promise<PasswordPolicy> {
        let result: PasswordPolicy = null;
        if (session instanceof SessionProxy) {
            try {
                const client = session.client('IAM') as IAM;
                const response = await client.getAccountPasswordPolicy().promise();
                console.info('getAccountPasswordPolicy response', response);
                const passwordPolicy =
                    request && Object.keys(request).length && request.serialize
                        ? request.serialize()
                        : JSON.parse(JSON.stringify(response.PasswordPolicy));
                result = PasswordPolicy.deserialize({
                    ...passwordPolicy,
                    ResourceId: resourceId,
                });
                LOGGER.info(
                    PasswordPolicy.TYPE_NAME,
                    `[${result.resourceId}] [${logicalResourceId}]`,
                    'successfully retrieved.'
                );
            } catch (err) {
                LOGGER.log(err);
                if (err && err.code === 'NoSuchEntity') {
                    throw new exceptions.NotFound(
                        PasswordPolicy.TYPE_NAME,
                        resourceId || logicalResourceId
                    );
                } else {
                    // Raise the original exception
                    throw err;
                }
            }
        } else {
            throw new exceptions.InvalidCredentials(
                'no aws session found - did you forget to register the execution role?'
            );
        }
        return Promise.resolve(result);
    }

    /**
     * Updates or inserts the password policy settings for the AWS account. This operation does not
     * support partial updates. No parameters are required, but if you do not specify a
     * parameter, that parameter's value reverts to its default value.
     *
     * @param session Current AWS session passed through from caller
     * @param request The updated options for the password policy
     * @param logicalResourceId The logical name of the resource as specified
     * in the template
     * @param resourceId The resource unique identifier
     */
    private async upsertPasswordPolicy(
        session: SessionProxy,
        request: PasswordPolicy,
        logicalResourceId?: string,
        resourceId?: string
    ): Promise<PasswordPolicy> {
        let result: PasswordPolicy = null;
        if (session instanceof SessionProxy) {
            try {
                const client = session.client('IAM') as IAM;
                const params = JSON.parse(JSON.stringify(request));
                delete params['ResourceId'];
                delete params['ExpirePasswords'];
                console.info('updateAccountPasswordPolicy input', params);
                const response = await client
                    .updateAccountPasswordPolicy(params)
                    .promise();
                console.info('updateAccountPasswordPolicy response', response);
                result = PasswordPolicy.deserialize({
                    ...params,
                    ResourceId: resourceId || uuidv4(),
                });
                LOGGER.info(
                    PasswordPolicy.TYPE_NAME,
                    `[${result.resourceId}] [${logicalResourceId}]`,
                    'successfully upserted.'
                );
            } catch (err) {
                LOGGER.log(err);
                throw new exceptions.InternalFailure(err.message);
            }
        } else {
            throw new exceptions.InvalidCredentials(
                'no aws session found - did you forget to register the execution role?'
            );
        }
        return Promise.resolve(result);
    }

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to enable handlers to process re-invocation
     */
    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: Dict
    ): Promise<ProgressEvent> {
        console.info('CREATE request', request);
        console.info('CREATE callbackContext', callbackContext);
        if (request.desiredResourceState?.resourceId) {
            LOGGER.info(
                this.typeName,
                `[${request.desiredResourceState.resourceId}] [${request.logicalResourceIdentifier}]`,
                'cannot contain identifier.'
            );
            throw new exceptions.InvalidRequest(
                'Resource identifier cannot be provided during creation.'
            );
        }
        let model: PasswordPolicy = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel>>(model);
        try {
            await this.retrievePasswordPolicy(
                session,
                request.logicalResourceIdentifier
            );
            throw new exceptions.AlreadyExists(
                PasswordPolicy.TYPE_NAME,
                request.logicalResourceIdentifier
            );
        } catch (err) {}
        model = await this.upsertPasswordPolicy(
            session,
            model,
            request.logicalResourceIdentifier
        );
        progress.resourceModel = model;
        progress.status = OperationStatus.Success;
        console.info('CREATE model primary identifier', model.getPrimaryIdentifier());
        console.info(
            'CREATE model additional identifiers',
            model.getAdditionalIdentifiers()
        );
        LOGGER.info('CREATE progress', progress);
        return progress;
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to enable handlers to process re-invocation
     */
    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: Dict
    ): Promise<ProgressEvent> {
        console.info('UPDATE request', request);
        const resourceId = request.previousResourceState.resourceId;
        if (!request.desiredResourceState?.resourceId) {
            throw new exceptions.NotFound(
                this.typeName,
                request.desiredResourceState.resourceId
            );
        } else if (request.desiredResourceState.resourceId !== resourceId) {
            LOGGER.info(
                this.typeName,
                `[NEW ${request.desiredResourceState.resourceId}] [${request.logicalResourceIdentifier}]`,
                `does not match identifier from saved resource [OLD ${resourceId}].`
            );
            throw new exceptions.NotUpdatable(
                'No resource matching the provided identifier.'
            );
        }
        let model: PasswordPolicy = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel>>(model);
        await this.retrievePasswordPolicy(
            session,
            request.logicalResourceIdentifier,
            resourceId
        );
        model = await this.upsertPasswordPolicy(
            session,
            model,
            request.logicalResourceIdentifier,
            resourceId
        );
        console.info('UPDATE model', model);
        progress.resourceModel = model;
        progress.status = OperationStatus.Success;
        LOGGER.info('UPDATE progress', progress);
        return progress;
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to enable handlers to process re-invocation
     */
    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: Dict
    ): Promise<ProgressEvent> {
        console.info('DELETE request', request);
        let model: PasswordPolicy = request.desiredResourceState;
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel>>();
        model = await this.retrievePasswordPolicy(
            session,
            request.logicalResourceIdentifier,
            model.resourceId
        );
        if (model) {
            if (session instanceof SessionProxy) {
                try {
                    const client = session.client('IAM') as IAM;
                    const response = await client
                        .deleteAccountPasswordPolicy()
                        .promise();
                    console.info('deleteAccountPasswordPolicy response', response);
                    LOGGER.info(
                        this.typeName,
                        `[${model.resourceId}] [${request.logicalResourceIdentifier}]`,
                        'successfully deleted.'
                    );
                } catch (err) {
                    LOGGER.log(err);
                    throw new exceptions.InternalFailure(err.message);
                }
            } else {
                throw new exceptions.InvalidCredentials(
                    'no aws session found - did you forget to register the execution role?'
                );
            }
            
        }
        progress.status = OperationStatus.Success;
        LOGGER.info('DELETE progress', progress);
        return progress;
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to enable handlers to process re-invocation
     */
    @handlerEvent(Action.Read)
    public async read(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: Dict
    ): Promise<ProgressEvent> {
        console.info('READ request', request);
        const model: PasswordPolicy = await this.retrievePasswordPolicy(
            session,
            request.logicalResourceIdentifier,
            request.desiredResourceState.resourceId,
            request.desiredResourceState
        );
        const progress = ProgressEvent.success<ProgressEvent<ResourceModel>>(model);
        LOGGER.info('READ progress', progress);
        return progress;
    }

    /**
     * CloudFormation invokes this handler when summary information about multiple
     * resources of this resource provider is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to enable handlers to process re-invocation
     */
    @handlerEvent(Action.List)
    public async list(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: Dict
    ): Promise<ProgressEvent> {
        console.info('LIST request', request);
        const models: Array<PasswordPolicy> = [];
        try {
            const model: PasswordPolicy = await this.retrievePasswordPolicy(
                session,
                request.logicalResourceIdentifier,
                request.desiredResourceState.resourceId,
                request.desiredResourceState
            );
            models.push(model);
        } catch (err) {
            if (!(err instanceof exceptions.NotFound)) {
                throw err;
            }
        }
        const progress = ProgressEvent.builder<ProgressEvent<PasswordPolicy>>()
            .status(OperationStatus.Success)
            .resourceModels(models)
            .build();
        LOGGER.info('LIST progress', progress);
        return progress;
    }
}

export const resource = new Resource(PasswordPolicy.TYPE_NAME, PasswordPolicy);

export const entrypoint = (...args: [any, any]) => {
    console.info('entrypoint input', ...args);
    return resource.entrypoint(...args);
};

export const testEntrypoint = (...args: [any, any]) => {
    console.info('testEntrypoint input', ...args);
    return resource.testEntrypoint(...args);
};
