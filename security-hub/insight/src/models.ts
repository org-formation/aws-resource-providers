// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::SecurityHub::Insight';

    @Exclude()
    protected readonly IDENTIFIER_KEY_INSIGHTARN: string = '/properties/InsightArn';

    @Expose({ name: 'InsightArn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'insightArn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    insightArn?: Optional<string>;
    @Expose({ name: 'InsightName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'insightName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    insightName?: Optional<string>;
    @Expose({ name: 'GroupByAttribute' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'groupByAttribute', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    groupByAttribute?: Optional<string>;
    @Expose({ name: 'FiltersJSON' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'filtersJSON', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    filtersJSON?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.insightArn != null) {
            identifier[this.IDENTIFIER_KEY_INSIGHTARN] = this.insightArn;
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

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;



}

