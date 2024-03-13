import { Action, BaseResource, handlerEvent } from 'cfn-rpdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { ResourceModel } from './models';
import { CostExplorer } from 'aws-sdk';
import { Subscribers } from 'aws-sdk/clients/costexplorer';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'CostExplorer', debug: true })
    public async create(action: Action, args: HandlerArgs<any>, service: CostExplorer, model: ResourceModel): Promise<ResourceModel> {
        const response = await service
            .createAnomalySubscription({
                AnomalySubscription: {
                    AccountId: model.accountId,
                    MonitorArnList: model.monitorArnList,
                    Subscribers: model.subscribers as Subscribers,
                    Threshold: model.threshold,
                    Frequency: model.frequency,
                    SubscriptionName: model.subscriptionName,
                },
            })
            .promise();

        model.arn = response.SubscriptionArn;
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'CostExplorer', debug: true })
    public async delete(action: Action, args: HandlerArgs<any>, service: CostExplorer): Promise<ResourceModel> {
        const model: ResourceModel = args.request.desiredResourceState;

        await service.deleteAnomalySubscription({ SubscriptionArn: model.arn }).promise();

        return Promise.resolve(null);
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
