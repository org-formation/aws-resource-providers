// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::IAM::ManagedPolicyStatement';

    @Exclude()
    protected readonly IDENTIFIER_KEY_RESOURCEID: string = '/properties/ResourceId';

    @Expose({ name: 'ResourceId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'resourceId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    resourceId?: Optional<string>;
    @Expose({ name: 'StatementId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'statementId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    statementId?: Optional<string>;
    @Expose({ name: 'StatementJson' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'statementJson', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    statementJson?: Optional<string>;
    @Expose({ name: 'ManagedPolicyName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'managedPolicyName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    managedPolicyName?: Optional<string>;
    @Expose({ name: 'ManagedPolicyPath' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'managedPolicyPath', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    managedPolicyPath?: Optional<string>;

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

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;



}

