// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::EC2::CoreNetworkRoute';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ID: string = '/properties/Id';

    @Expose({ name: 'DestinationIpv6CidrBlock' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'destinationIpv6CidrBlock', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    destinationIpv6CidrBlock?: Optional<string>;
    @Expose({ name: 'DestinationCidrBlock' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'destinationCidrBlock', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    destinationCidrBlock?: Optional<string>;
    @Expose({ name: 'RouteTableId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'routeTableId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    routeTableId?: Optional<string>;
    @Expose({ name: 'VpcAttachmentId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'vpcAttachmentId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    vpcAttachmentId?: Optional<string>;
    @Expose({ name: 'MaxWaitSeconds' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'maxWaitSeconds', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    maxWaitSeconds?: Optional<number>;
    @Expose({ name: 'CoreNetworkArn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'coreNetworkArn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    coreNetworkArn?: Optional<string>;
    @Expose({ name: 'Id' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'id', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    id?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.id != null) {
            identifier[this.IDENTIFIER_KEY_ID] = this.id;
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

