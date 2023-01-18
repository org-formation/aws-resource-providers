// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::DirectConnect::TransitVirtualInterface';

    @Exclude()
    protected readonly IDENTIFIER_KEY_VIRTUALINTERFACEID: string = '/properties/VirtualInterfaceId';
    @Exclude()
    protected readonly IDENTIFIER_KEY_ARN: string = '/properties/Arn';

    @Expose({ name: 'ConnectionId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'connectionId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    connectionId?: Optional<string>;
    @Expose({ name: 'VirtualInterfaceName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'virtualInterfaceName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    virtualInterfaceName?: Optional<string>;
    @Expose({ name: 'Vlan' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'vlan', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    vlan?: Optional<number>;
    @Expose({ name: 'Asn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'asn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    asn?: Optional<number>;
    @Expose({ name: 'Mtu' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'mtu', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    mtu?: Optional<number>;
    @Expose({ name: 'AuthKey' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'authKey', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    authKey?: Optional<string>;
    @Expose({ name: 'AmazonAddress' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'amazonAddress', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    amazonAddress?: Optional<string>;
    @Expose({ name: 'CustomerAddress' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'customerAddress', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    customerAddress?: Optional<string>;
    @Expose({ name: 'AddressFamily' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'addressFamily', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    addressFamily?: Optional<string>;
    @Expose({ name: 'DirectConnectGatewayId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'directConnectGatewayId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    directConnectGatewayId?: Optional<string>;
    @Expose({ name: 'EnableSiteLink' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'enableSiteLink', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    enableSiteLink?: Optional<boolean>;
    @Expose({ name: 'Tags' })
    @Type(() => Tag)
    tags?: Optional<Array<Tag>>;
    @Expose({ name: 'VirtualInterfaceId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'virtualInterfaceId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    virtualInterfaceId?: Optional<string>;
    @Expose({ name: 'VirtualInterfaceState' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'virtualInterfaceState', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    virtualInterfaceState?: Optional<string>;
    @Expose({ name: 'OwnerAccount' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'ownerAccount', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    ownerAccount?: Optional<string>;
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
        if (this.virtualInterfaceId != null) {
            identifier[this.IDENTIFIER_KEY_VIRTUALINTERFACEID] = this.virtualInterfaceId;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        if (this.getIdentifier_Arn() != null) {
            identifiers.push(this.getIdentifier_Arn());
        }
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }

    @Exclude()
    public getIdentifier_Arn(): Dict {
        const identifier: Dict = {};
        if ((this as any).arn != null) {
            identifier[this.IDENTIFIER_KEY_ARN] = (this as any).arn;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }
}

export class Tag extends BaseModel {
    ['constructor']: typeof Tag;


    @Expose({ name: 'Key' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'key', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    key?: Optional<string>;
    @Expose({ name: 'Value' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'value_', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    value_?: Optional<string>;

}

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;



}

