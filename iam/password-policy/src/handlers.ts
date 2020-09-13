import { IAM } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { v4 as uuidv4 } from 'uuid';
import { Action, BaseResource, exceptions, handlerEvent, Optional, CfnResponse } from 'cfn-rpdk';

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
     * @param service AWS service from current session passed through from caller
     * @param logicalResourceId The logical name of the resource as specified
     * in the template
     * @param resourceId The resource unique identifier
     * @param request The current state for the password policy
     */
    private async retrievePasswordPolicy(service: IAM, logicalResourceId?: string, resourceId?: string, request?: PasswordPolicy): Promise<PasswordPolicy> {
        let result: PasswordPolicy = null;
        try {
            const response = await service.getAccountPasswordPolicy().promise();
            console.info('getAccountPasswordPolicy response', response);
            const passwordPolicy = request && Object.keys(request).length && request.serialize ? request.serialize() : JSON.parse(JSON.stringify(response.PasswordPolicy));
            result = PasswordPolicy.deserialize({
                ...passwordPolicy,
                ResourceId: resourceId,
            });
            LOGGER.info(PasswordPolicy.TYPE_NAME, `[${result.resourceId}] [${logicalResourceId}]`, 'successfully retrieved.');
        } catch (err) {
            LOGGER.log(err);
            if (err && err.code === 'NoSuchEntity') {
                throw new exceptions.NotFound(PasswordPolicy.TYPE_NAME, resourceId || logicalResourceId);
            } else {
                // Raise the original exception
                throw err;
            }
        }
        return Promise.resolve(result);
    }

    /**
     * Updates or inserts the password policy settings for the AWS account. This operation does not
     * support partial updates. No parameters are required, but if you do not specify a
     * parameter, that parameter's value reverts to its default value.
     *
     * @param service AWS service from current session passed through from caller
     * @param request The updated options for the password policy
     * @param logicalResourceId The logical name of the resource as specified
     * in the template
     * @param resourceId The resource unique identifier
     */
    private async upsertPasswordPolicy(service: IAM, request: PasswordPolicy, logicalResourceId?: string, resourceId?: string): Promise<PasswordPolicy> {
        let result: PasswordPolicy = null;
        const params = JSON.parse(JSON.stringify(request));
        delete params['ResourceId'];
        delete params['ExpirePasswords'];
        console.info('updateAccountPasswordPolicy input', params);
        const response = await service.updateAccountPasswordPolicy(params).promise();
        console.info('updateAccountPasswordPolicy response', response);
        result = PasswordPolicy.deserialize({
            ...params,
            ResourceId: resourceId || uuidv4(),
        });
        LOGGER.info(PasswordPolicy.TYPE_NAME, `[${result.resourceId}] [${logicalResourceId}]`, 'successfully upserted.');
        return Promise.resolve(result);
    }

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     */
    @handlerEvent(Action.Create)
    @commonAws({
        serviceName: 'IAM',
        debug: true,
    })
    public async create(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM): Promise<PasswordPolicy> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;
        if (desiredResourceState?.resourceId) {
            LOGGER.info(this.typeName, `[${desiredResourceState.resourceId}] [${logicalResourceIdentifier}]`, 'cannot contain identifier.');
            throw new exceptions.InvalidRequest('Resource identifier cannot be provided during creation.');
        }
        let model: PasswordPolicy = desiredResourceState;
        try {
            await this.retrievePasswordPolicy(service, logicalResourceIdentifier);
            throw new exceptions.AlreadyExists(PasswordPolicy.TYPE_NAME, logicalResourceIdentifier);
        } catch (err) {}
        model = await this.upsertPasswordPolicy(service, model, logicalResourceIdentifier);
        console.info('CREATE model primary identifier', model.getPrimaryIdentifier());
        console.info('CREATE model additional identifiers', model.getAdditionalIdentifiers());
        return Promise.resolve(model);
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     */
    @handlerEvent(Action.Update)
    @commonAws({
        serviceName: 'IAM',
        debug: true,
    })
    public async update(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM): Promise<PasswordPolicy> {
        const { desiredResourceState, logicalResourceIdentifier, previousResourceState } = args.request;
        const resourceId = previousResourceState.resourceId;
        if (!desiredResourceState?.resourceId) {
            throw new exceptions.NotFound(this.typeName, desiredResourceState.resourceId);
        } else if (desiredResourceState.resourceId !== resourceId) {
            LOGGER.info(this.typeName, `[NEW ${desiredResourceState.resourceId}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${resourceId}].`);
            throw new exceptions.NotUpdatable('No resource matching the provided identifier.');
        }
        let model: PasswordPolicy = desiredResourceState;
        await this.retrievePasswordPolicy(service, logicalResourceIdentifier, resourceId);
        model = await this.upsertPasswordPolicy(service, model, logicalResourceIdentifier, resourceId);
        return Promise.resolve(model);
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     */
    @handlerEvent(Action.Delete)
    @commonAws({
        serviceName: 'IAM',
        debug: true,
    })
    public async delete(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM): Promise<null> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;

        let model: PasswordPolicy = desiredResourceState;
        model = await this.retrievePasswordPolicy(service, logicalResourceIdentifier, model.resourceId);
        if (model) {
            const response = await service.deleteAccountPasswordPolicy().promise();
            console.info('deleteAccountPasswordPolicy response', response);
            LOGGER.info(this.typeName, `[${model.resourceId}] [${logicalResourceIdentifier}]`, 'successfully deleted.');
        }
        return Promise.resolve(null);
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     */
    @handlerEvent(Action.Read)
    @commonAws({
        serviceName: 'IAM',
        debug: true,
    })
    public async read(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM): Promise<PasswordPolicy> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;
        return await this.retrievePasswordPolicy(service, logicalResourceIdentifier, desiredResourceState.resourceId, desiredResourceState);
    }

    /**
     * CloudFormation invokes this handler when summary information about multiple
     * resources of this resource provider is required.
     */
    @handlerEvent(Action.List)
    @commonAws({
        serviceName: 'IAM',
        debug: true,
    })
    public async list(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM): Promise<PasswordPolicy[]> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;
        const models: Array<PasswordPolicy> = [];
        try {
            const model: PasswordPolicy = await this.retrievePasswordPolicy(service, logicalResourceIdentifier, desiredResourceState.resourceId, desiredResourceState);
            models.push(model);
        } catch (err) {
            if (!(err instanceof exceptions.NotFound)) {
                throw err;
            }
        }
        return Promise.resolve(models);
    }
}

export const resource = new Resource(PasswordPolicy.TYPE_NAME, PasswordPolicy);

export const entrypoint = (...args: [any, any]): Promise<CfnResponse<ResourceModel>> => {
    console.info('entrypoint input', ...args);
    return resource.entrypoint(...args);
};

export const testEntrypoint = (...args: [any, any]): Promise<CfnResponse<ResourceModel>> => {
    console.info('testEntrypoint input', ...args);
    return resource.testEntrypoint(...args);
};
