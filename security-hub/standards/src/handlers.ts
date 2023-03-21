/* eslint-disable prettier/prettier */
import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';

import { Action, BaseResource, exceptions, handlerEvent, Logger } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';

const createStandardArn = (region: string, standardCode: string) => {
    if (standardCode == 'CIS1.4') return `arn:aws:securityhub:${region}::standards/cis-aws-foundations-benchmark/v/1.4.0`;
    if (standardCode == 'CIS1.2') return `arn:aws:securityhub:::ruleset/cis-aws-foundations-benchmark/v/1.2.0`;
    if (standardCode == 'PCIDSS') return `arn:aws:securityhub:${region}::standards/pci-dss/v/3.2.1`;
    if (standardCode == 'AFSBP') return `arn:aws:securityhub:${region}::standards/aws-foundational-security-best-practices/v/1.0.0`;
    if (standardCode == 'NIST') return `arn:aws:securityhub:${region}::standards/nist-800-53/v/5.0.0`;
    throw new Error('unknown standardCode');
};
export interface CallbackContext extends Record<string, any> {
    stabilizing?: true;
}

async function ensureStandardsEnabled(service: SecurityHub, model: ResourceModel, args: HandlerArgs<ResourceModel, Record<string, any>>) {
    const response = await service.getEnabledStandards({}).promise();
    const logger = args.logger;
    const currentlyEnabledStandards = response.StandardsSubscriptions.map(x => x.StandardsArn);
    const desiredStandards: string[] = [];
    if (model.aFSBP === "ENABLED") {
        desiredStandards.push(createStandardArn(args.request.region, 'AFSBP'));
    }
    if (model.pCIDSS === "ENABLED") {
        desiredStandards.push(createStandardArn(args.request.region, 'PCIDSS'));
    }
    if (model.cIS12 === "ENABLED") {
        desiredStandards.push(createStandardArn(args.request.region, 'CIS1.2'));
    }
    if (model.cIS14 === "ENABLED") {
        desiredStandards.push(createStandardArn(args.request.region, 'CIS1.4'));
    }
    if (model.nIST === "ENABLED") {
        desiredStandards.push(createStandardArn(args.request.region, 'NIST'));
    }

    const standardsToDisable = currentlyEnabledStandards.filter(x => !desiredStandards.includes(x));
    const standardsToEnable = desiredStandards.filter(x => !currentlyEnabledStandards.includes(x)).map(x => ({ StandardsArn: x }));
    logger?.log({ standardsToDisable, standardsToEnable });
    if (standardsToEnable.length > 0) {
        const response = await service.batchEnableStandards({
            StandardsSubscriptionRequests: standardsToEnable
        }).promise();
        logger?.log({ batchEnableStandardsResponse: response });
    }
    
    if (standardsToDisable.length > 0) {
        const subscriptions = standardsToDisable.map(x=> {
            const subscription = response.StandardsSubscriptions.find(y=>y.StandardsArn === x);
            return subscription.StandardsSubscriptionArn;
        })

        logger?.log({ StandardsSubscriptionArns: subscriptions });
        const disableResponse = await service.batchDisableStandards({
            StandardsSubscriptionArns: subscriptions
        }).promise();
        logger?.log({ batchDisableStandardsResponse: disableResponse });
    }

    let allReady = false;
    let numTries = 0;
    while(!allReady && numTries < 10) {
        await delay(4000);

        const standards = await service.getEnabledStandards({ }).promise();
        allReady = !standards.StandardsSubscriptions.find(x => x.StandardsStatus != "READY");
        numTries++;
    }
}
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {

        args.logger?.log({ action, message: 'start handler' });
        await ensureStandardsEnabled(service, model, args);
        
        model.resourceId = "security-hub-standards"
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        
        args.logger?.log({ action, message: 'start handler' });
        await ensureStandardsEnabled(service, model, args);

        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<null> {
        await ensureStandardsEnabled(service, new ResourceModel({}), args);
        return Promise.resolve(null);
    }
}
export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
