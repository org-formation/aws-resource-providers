/* eslint-disable prettier/prettier */
import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';

import { Action, BaseResource, exceptions, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const filters = JSON.parse(model.filtersJSON);
        const response = await service.createInsight({ Name: model.insightName, Filters: filters, GroupByAttribute: model.groupByAttribute }).promise();
        model.insightArn = response.InsightArn;
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const filters = JSON.parse(model.filtersJSON);
        await service.updateInsight({ InsightArn: model.insightArn, Name: model.insightName, Filters: filters, GroupByAttribute: model.groupByAttribute }).promise();
        return model;
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<null> {
        if (model.insightArn) {
            await service.deleteInsight({ InsightArn: model.insightArn }).promise();
        }
        return Promise.resolve(null);
    }
}
export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
