/* eslint-disable prettier/prettier */
import { SecurityHub } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';

import { Action, BaseResource, handlerEvent } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ service: SecurityHub, debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        const result = await service.createFindingAggregator({ RegionLinkingMode : model.regionLinkingMode, Regions: model.regions}).promise();
        model.resourceId = result.FindingAggregatorArn;
        return model;
    }

    @handlerEvent(Action.Update)
    @commonAws({ service: SecurityHub, debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<ResourceModel> {
        await service.updateFindingAggregator({ FindingAggregatorArn: model.resourceId, RegionLinkingMode: model.regionLinkingMode, Regions: model.regions }).promise();
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ service: SecurityHub, debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: SecurityHub, model: ResourceModel): Promise<null> {
        await service.deleteFindingAggregator({ FindingAggregatorArn: model.resourceId }).promise();
        return Promise.resolve(null);
    }
}
export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
