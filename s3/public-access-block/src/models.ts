// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::S3::PublicAccessBlock';

    @Exclude()
    protected readonly IDENTIFIER_KEY_RESOURCEID: string = '/properties/ResourceId';

    @Expose({ name: 'BlockPublicAcls' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'blockPublicAcls', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    blockPublicAcls?: Optional<boolean>;
    @Expose({ name: 'BlockPublicPolicy' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'blockPublicPolicy', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    blockPublicPolicy?: Optional<boolean>;
    @Expose({ name: 'IgnorePublicAcls' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'ignorePublicAcls', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    ignorePublicAcls?: Optional<boolean>;
    @Expose({ name: 'RestrictPublicBuckets' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'restrictPublicBuckets', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    restrictPublicBuckets?: Optional<boolean>;
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

