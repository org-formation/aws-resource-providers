// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::CostExplorer::AnomalySubscription';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ARN: string = '/properties/Arn';

    @Expose({ name: 'Arn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'arn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    arn?: Optional<string>;
    @Expose({ name: 'AccountId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'accountId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    accountId?: Optional<string>;
    @Expose({ name: 'MonitorArnList' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'monitorArnList', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    monitorArnList?: Optional<Array<string>>;
    @Expose({ name: 'Subscribers' })
    @Type(() => Subscriber)
    subscribers?: Optional<Array<Subscriber>>;
    @Expose({ name: 'Threshold' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'threshold', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    threshold?: Optional<number>;
    @Expose({ name: 'Frequency' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'frequency', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    frequency?: Optional<string>;
    @Expose({ name: 'SubscriptionName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'subscriptionName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    subscriptionName?: Optional<string>;

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

export class Subscriber extends BaseModel {
    ['constructor']: typeof Subscriber;


    @Expose({ name: 'Address' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'address', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    address?: Optional<string>;
    @Expose({ name: 'Type' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'type_', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    type_?: Optional<string>;

}

