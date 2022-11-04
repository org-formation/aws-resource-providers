import { Organizations } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
// import { v4 as uuidv4 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';
import { Action, BaseResource, exceptions, handlerEvent } from 'cfn-rpdk';
import { ResourceModel } from './models';
import { DisableAWSServiceAccessRequest, EnableAWSServiceAccessRequest } from 'aws-sdk/clients/organizations';

// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

interface CallbackContext extends Record<string, any> {}

class Resource extends BaseResource<ResourceModel> {
    
    @handlerEvent(Action.Create)
    @commonAws({
        serviceName: 'Organizations',
        debug: true
    })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations, model: ResourceModel): Promise<ResourceModel> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;
        
        //let model: ResourceModel = desiredResourceState;
        
        console.log(JSON.stringify(model));

        // the account number to which we are deploying the template
        const targetAccountId = args.request.awsAccountId

        const request1 : EnableAWSServiceAccessRequest = {
            ServicePrincipal: model.servicePrincipal
        }


        await service.enableAWSServiceAccess(request1).promise();
        
        //const request2 : RegisterDelegatedAdministratorRequest = {
            
            //fix model names to match api attributes
            
        //    AccountId: model.accountNumber,
        //    ServicePrincipal: model.servicePrincipal
        //}

        //await service.registerDelegatedAdministrator(request2).promise();

        const arnUuid = uuidv4();
        
        //model.arn = 'arn:community:organizations::${targetAccountId}:delegated-admin/${model.accountNumber}-${model.servicePrincipal}'
        
        model.resourceId=`arn:community:organizations::${targetAccountId}:enabled-service/${arnUuid}`
        
        //response.
 

        return Promise.resolve(model);
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     */
    @handlerEvent(Action.Update)
    @commonAws({
        serviceName: 'Organizations',
        debug: true,
    })
    
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations, model: ResourceModel): Promise<ResourceModel> {
        
        throw new exceptions.InvalidRequest("Type doesn't support updates.")
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     */
    @handlerEvent(Action.Delete)
    @commonAws({
        serviceName: 'Organizations',
        debug: true,
    })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations): Promise<null> {
        const { desiredResourceState, logicalResourceIdentifier, previousResourceState } = args.request;

        // let model = args.request.
        
        //const request1 : DeregisterDelegatedAdministratorRequest = {
        //    AccountId : previousResourceState.accountNumber,
        //    ServicePrincipal : previousResourceState.servicePrincipal
        //}

        //await service.deregisterDelegatedAdministrator(request1).promise();

        const request2 : DisableAWSServiceAccessRequest = {
            ServicePrincipal : desiredResourceState.servicePrincipal
        }

        await service.disableAWSServiceAccess(request2).promise();

        //let model: PasswordPolicy = desiredResourceState;
        //model = await this.retrievePasswordPolicy(service, logicalResourceIdentifier, model.arn);
        //if (model) {
        //    const response = await service.deleteAccountPasswordPolicy().promise();
        //    console.info('deleteAccountPasswordPolicy response', response);
        LOGGER.info(this.typeName, `[${previousResourceState.resourceId}] [${logicalResourceIdentifier}]`, 'successfully deleted.');
        // }

        
         
        return Promise.resolve(null);
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     */
    @handlerEvent(Action.Read)
    @commonAws({
        serviceName: 'Organizations',
        debug: true,
    })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: Organizations): Promise<ResourceModel> {
        const { desiredResourceState, logicalResourceIdentifier, previousResourceState } = args.request;
        return previousResourceState
        //return await this.retrievePasswordPolicy(service, logicalResourceIdentifier, desiredResourceState.resourceId, desiredResourceState);


    }

    /**
     * CloudFormation invokes this handler when summary information about multiple
     * resources of this resource provider is required.
     */
    // @handlerEvent(Action.List)
    // @commonAws({
    //     serviceName: 'Organizations',
    //     debug: false,
    // })
    // public async list(action: Action, args: HandlerArgs<PasswordPolicy>, service: IAM): Promise<PasswordPolicy[]> {
    //     const { desiredResourceState, logicalResourceIdentifier } = args.request;
    //     const models: Array<PasswordPolicy> = [];
    //     try {
    //         const model: PasswordPolicy = await this.retrievePasswordPolicy(service, logicalResourceIdentifier, desiredResourceState.resourceId, desiredResourceState);
    //         models.push(model);
    //     } catch (err) {
    //         if (!(err instanceof exceptions.NotFound)) {
    //             throw err;
    //         }
    //     }
    //     return Promise.resolve(models);
    // }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;