// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::DirectConnect::Gateway';

    @Exclude()
    protected readonly IDENTIFIER_KEY_DIRECTCONNECTGATEWAYID: string = '/properties/DirectConnectGatewayId';

    @Expose({ name: 'DirectConnectGatewayId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'directConnectGatewayId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    directConnectGatewayId?: Optional<string>;
    @Expose({ name: 'DirectConnectGatewayName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'directConnectGatewayName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    directConnectGatewayName?: Optional<string>;
    @Expose({ name: 'OwnerAccount' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'ownerAccount', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    ownerAccount?: Optional<string>;
    @Expose({ name: 'AmazonSideAsn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'amazonSideAsn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    amazonSideAsn?: Optional<number>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.directConnectGatewayId != null) {
            identifier[this.IDENTIFIER_KEY_DIRECTCONNECTGATEWAYID] = this.directConnectGatewayId;
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

