import { IAM } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { v4 as uuidv4 } from 'uuid';
import { Action, BaseResource, exceptions, handlerEvent, Logger, Optional, CfnResponse } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';

import { ResourceModel } from './models';

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
    private async retrievePasswordPolicy(service: IAM, logger: Logger, logicalResourceId?: string, resourceId?: string, request?: PasswordPolicy): Promise<PasswordPolicy> {
        let result: PasswordPolicy = null;
        try {
            const response = await service.getAccountPasswordPolicy().promise();
            logger.log('getAccountPasswordPolicy response', response);
            const passwordPolicy = request && Object.keys(request).length && request.serialize ? request.serialize() : JSON.parse(JSON.stringify(response.PasswordPolicy));
            result = PasswordPolicy.deserialize({
                ...passwordPolicy,
                ResourceId: resourceId,
            });
            logger.log(PasswordPolicy.TYPE_NAME, `[${result.resourceId}] [${logicalResourceId}]`, 'successfully retrieved.');
        } catch (err) {
            logger.log(err);
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
    private async upsertPasswordPolicy(service: IAM, logger: Logger, request: PasswordPolicy, logicalResourceId?: string, resourceId?: string): Promise<PasswordPolicy> {
        let result: PasswordPolicy = null;
        const params = JSON.parse(JSON.stringify(request));
        delete params['ResourceId'];
        delete params['ExpirePasswords'];
        logger.log('updateAccountPasswordPolicy input', params);
        const response = await service.updateAccountPasswordPolicy(params).promise();
        logger.log('updateAccountPasswordPolicy response', response);
        result = PasswordPolicy.deserialize({
            ...params,
            ResourceId: resourceId || uuidv4(),
        });
        logger.log(PasswordPolicy.TYPE_NAME, `[${result.resourceId}] [${logicalResourceId}]`, 'successfully upserted.');
        return Promise.resolve(result);
    }

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     */
    @handlerEvent(Action.Create)
    @commonAws({ service: IAM, debug: true })
    public async create(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM, model: PasswordPolicy): Promise<PasswordPolicy> {
        const { logicalResourceIdentifier } = args.request;
        if (model?.resourceId) {
            args.logger.log(this.typeName, `[${model.resourceId}] [${logicalResourceIdentifier}]`, 'cannot contain identifier.');
            throw new exceptions.InvalidRequest('Resource identifier cannot be provided during creation.');
        }
        try {
            await this.retrievePasswordPolicy(service, args.logger, logicalResourceIdentifier);
            throw new exceptions.AlreadyExists(PasswordPolicy.TYPE_NAME, logicalResourceIdentifier);
        } catch (err) {}
        const result = await this.upsertPasswordPolicy(service, args.logger, model, logicalResourceIdentifier);
        args.logger.log('CREATE model primary identifier', result.getPrimaryIdentifier());
        args.logger.log('CREATE model additional identifiers', result.getAdditionalIdentifiers());
        return Promise.resolve(result);
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     */
    @handlerEvent(Action.Update)
    @commonAws({ service: IAM, debug: true })
    public async update(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM, model: PasswordPolicy): Promise<PasswordPolicy> {
        const { logicalResourceIdentifier, previousResourceState } = args.request;
        const resourceId = previousResourceState.resourceId;
        if (!model?.resourceId) {
            throw new exceptions.NotFound(this.typeName, model.resourceId);
        } else if (model.resourceId !== resourceId) {
            args.logger.log(this.typeName, `[NEW ${model.resourceId}] [${logicalResourceIdentifier}]`, `does not match identifier from saved resource [OLD ${resourceId}].`);
            throw new exceptions.NotUpdatable('No resource matching the provided identifier.');
        }
        await this.retrievePasswordPolicy(service, args.logger, logicalResourceIdentifier, resourceId);
        const result = await this.upsertPasswordPolicy(service, args.logger, model, logicalResourceIdentifier, resourceId);
        return Promise.resolve(result);
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     */
    @handlerEvent(Action.Delete)
    @commonAws({ service: IAM, debug: true })
    public async delete(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM, model: PasswordPolicy): Promise<null> {
        const { logicalResourceIdentifier } = args.request;
        const result = await this.retrievePasswordPolicy(service, args.logger, logicalResourceIdentifier, model.resourceId);
        if (result) {
            const response = await service.deleteAccountPasswordPolicy().promise();
            args.logger.log('deleteAccountPasswordPolicy response', response);
            args.logger.log(this.typeName, `[${result.resourceId}] [${logicalResourceIdentifier}]`, 'successfully deleted.');
        }
        return Promise.resolve(null);
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     */
    @handlerEvent(Action.Read)
    @commonAws({ service: IAM, debug: true })
    public async read(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM, model: PasswordPolicy): Promise<PasswordPolicy> {
        const { logicalResourceIdentifier } = args.request;
        return await this.retrievePasswordPolicy(service, args.logger, logicalResourceIdentifier, model.resourceId, model);
    }

    /**
     * CloudFormation invokes this handler when summary information about multiple
     * resources of this resource provider is required.
     */
    @handlerEvent(Action.List)
    @commonAws({ service: IAM, debug: true })
    public async list(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM, model: PasswordPolicy): Promise<PasswordPolicy[]> {
        const { logicalResourceIdentifier } = args.request;
        const models: Array<PasswordPolicy> = [];
        try {
            const result: PasswordPolicy = await this.retrievePasswordPolicy(service, args.logger, logicalResourceIdentifier, model.resourceId, model);
            models.push(result);
        } catch (err) {
            if (!(err instanceof exceptions.NotFound)) {
                throw err;
            }
        }
        return Promise.resolve(models);
    }
}

export const resource = new Resource(PasswordPolicy.TYPE_NAME, PasswordPolicy);

export const entrypoint = (...args: [any, any]): Promise<CfnResponse<any>> => {
    // console.log('entrypoint input', ...args);
    return resource.entrypoint(...args);
};

export const testEntrypoint = (...args: [any, any]): Promise<CfnResponse<any>> => {
    // console.log('testEntrypoint input', ...args);
    return resource.testEntrypoint(...args);
};
