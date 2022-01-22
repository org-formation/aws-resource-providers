// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::SSO::AssignmentGroup';

    @Exclude()
    protected readonly IDENTIFIER_KEY_RESOURCEID: string = '/properties/ResourceId';

    @Expose({ name: 'InstanceArn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'instanceArn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    instanceArn?: Optional<string>;
    @Expose({ name: 'ResourceId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'resourceId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    resourceId?: Optional<string>;
    @Expose({ name: 'PermissionSets' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'permissionSets', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    permissionSets?: Optional<Array<string>>;
    @Expose({ name: 'PrincipalId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'principalId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    principalId?: Optional<string>;
    @Expose({ name: 'PrincipalType' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'principalType', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    principalType?: Optional<string>;
    @Expose({ name: 'Targets' })
    @Type(() => Target)
    targets?: Optional<Array<Target>>;

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

export class Target extends BaseModel {
    ['constructor']: typeof Target;


    @Expose({ name: 'TargetType' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'targetType', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    targetType?: Optional<string>;
    @Expose({ name: 'TargetIds' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'targetIds', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    targetIds?: Optional<Array<string>>;

}

