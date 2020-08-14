// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'OC::ORG::RegionDefaults';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ACCOUNTID: string = '/properties/AccountId';

    @Expose({ name: 'AccountId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'accountId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    accountId?: Optional<string>;
    @Expose({ name: 'EnableEbsEncryptionByDefault' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'enableEbsEncryptionByDefault', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    enableEbsEncryptionByDefault?: Optional<boolean>;
    @Expose({ name: 'DefaultEbsEncryptionKeyId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'defaultEbsEncryptionKeyId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    defaultEbsEncryptionKeyId?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.accountId != null) {
            identifier[this.IDENTIFIER_KEY_ACCOUNTID] = this.accountId;
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

