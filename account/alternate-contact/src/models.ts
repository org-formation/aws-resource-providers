// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::Account::AlternateContact';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ALTERNATECONTACTTYPE: string = '/properties/AlternateContactType';

    @Expose({ name: 'AlternateContactType' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'alternateContactType', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    alternateContactType?: Optional<string>;
    @Expose({ name: 'Name' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'name', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    name?: Optional<string>;
    @Expose({ name: 'EmailAddress' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'emailAddress', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    emailAddress?: Optional<string>;
    @Expose({ name: 'PhoneNumber' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'phoneNumber', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    phoneNumber?: Optional<string>;
    @Expose({ name: 'Title' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'title', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    title?: Optional<string>;
    @Expose({ name: 'AccountId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'accountId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    accountId?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.alternateContactType != null) {
            identifier[this.IDENTIFIER_KEY_ALTERNATECONTACTTYPE] = this.alternateContactType;
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

