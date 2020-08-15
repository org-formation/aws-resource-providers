// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'OC::ServiceQuotas::CloudFormationQuotas';

    @Exclude()
    protected readonly IDENTIFIER_KEY_RESOURCEID: string = '/properties/ResourceId';

    @Expose({ name: 'Stacks' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'stacks', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    stacks?: Optional<integer>;
    @Expose({ name: 'ResourceTypes' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'resourceTypes', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    resourceTypes?: Optional<integer>;
    @Expose({ name: 'VersionsPerResourceType' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'versionsPerResourceType', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    versionsPerResourceType?: Optional<integer>;
    @Expose({ name: 'StackSetsPerAdministratorAccount' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'stackSetsPerAdministratorAccount', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    stackSetsPerAdministratorAccount?: Optional<integer>;
    @Expose({ name: 'StackInstancesPerStackSet' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'stackInstancesPerStackSet', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    stackInstancesPerStackSet?: Optional<integer>;
    @Expose({ name: 'ResourceId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'resourceId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    resourceId?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.resourceId != null) {
            identifier[this.IDENTIFIER_KEY_RESOURCEID] = this.resourceId;
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

