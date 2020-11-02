import { Action, BaseResource, handlerEvent } from 'cfn-rpdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { ResourceModel } from './models';
import { CostExplorer } from 'aws-sdk';

class Resource extends BaseResource<ResourceModel> {
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'CostExplorer', debug: true })
    public async create(action: Action, args: HandlerArgs<any>, service: CostExplorer, model: ResourceModel): Promise<ResourceModel> {
        const response = await service
            .createAnomalyMonitor({
                AnomalyMonitor: {
                    MonitorName: model.monitorName,
                    MonitorDimension: model.monitorDimension,
                    MonitorType: model.monitorType,
                    MonitorSpecification: model.monitorSpecification as CostExplorer.Expression,
                    DimensionalValueCount: model.dimensionalValueCount,
                },
            })
            .promise();

        model.arn = response.MonitorArn;
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'CostExplorer', debug: true })
    public async delete(action: Action, args: HandlerArgs<any>, service: CostExplorer): Promise<ResourceModel> {
        const model: ResourceModel = args.request.desiredResourceState;

        await service.deleteAnomalyMonitor({ MonitorArn: model.arn }).promise();

        return Promise.resolve(null);
    }
}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
