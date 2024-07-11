// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::Organizations::InstanceMetadataDefaults';

    @Exclude()
    protected readonly IDENTIFIER_KEY_RESOURCEID: string = '/properties/ResourceId';

    @Expose({ name: 'HttpTokens' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'httpTokens', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    httpTokens?: Optional<string>;
    @Expose({ name: 'HttpPutResponseHopLimit' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'httpPutResponseHopLimit', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    httpPutResponseHopLimit?: Optional<integer>;
    @Expose({ name: 'HttpEndpoint' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'httpEndpoint', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    httpEndpoint?: Optional<string>;
    @Expose({ name: 'InstanceMetadataTags' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'instanceMetadataTags', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    instanceMetadataTags?: Optional<string>;
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

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;



}

