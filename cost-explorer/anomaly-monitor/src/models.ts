// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::CostExplorer::AnomalyMonitor';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ARN: string = '/properties/Arn';

    @Expose({ name: 'MonitorName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'monitorName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    monitorName?: Optional<string>;
    @Expose({ name: 'MonitorType' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'monitorType', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    monitorType?: Optional<string>;
    @Expose({ name: 'MonitorDimension' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'monitorDimension', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    monitorDimension?: Optional<string>;
    @Expose({ name: 'MonitorSpecification' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Object, 'monitorSpecification', value, obj, [Map]),
        {
            toClassOnly: true,
        }
    )
    monitorSpecification?: Optional<Map<string, object>>;
    @Expose({ name: 'DimensionalValueCount' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'dimensionalValueCount', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    dimensionalValueCount?: Optional<number>;
    @Expose({ name: 'Arn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'arn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    arn?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.arn != null) {
            identifier[this.IDENTIFIER_KEY_ARN] = this.arn;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

