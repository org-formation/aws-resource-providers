import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Detective, IAM, SecurityHub } from 'aws-sdk';
import { request } from 'http';
import { ResourceModel, TypeConfigurationModel } from './models';
import { FMS } from '@aws-sdk/client-fms';


interface CallbackContext extends Record<string, any> {}

class Resource extends BaseResource<ResourceModel> {

    @handlerEvent(Action.Create)
    @commonAws({ service: IAM, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<ResourceModel> {
        const { accountId } = model;

        const fms = new FMS({credentials: service.config.credentials});
        
        await fms.associateAdminAccount({ AdminAccount: accountId });

        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: IAM, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: IAM, model: ResourceModel): Promise<null> {
        const fms = new FMS({credentials: service.config.credentials});
        
        await fms.disassociateAdminAccount({  });

        return Promise.resolve(null);
    }

}

// @ts-ignore // if running against v1.0.1 or earlier of plugin the 5th argument is not known but best to ignored (runtime code may warn)
export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel)!;

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
