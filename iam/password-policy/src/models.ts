// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::IAM::PasswordPolicy';

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
    @Expose({ name: 'MinimumPasswordLength' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'minimumPasswordLength', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    minimumPasswordLength?: Optional<integer>;
    @Expose({ name: 'RequireSymbols' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'requireSymbols', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    requireSymbols?: Optional<boolean>;
    @Expose({ name: 'RequireNumbers' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'requireNumbers', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    requireNumbers?: Optional<boolean>;
    @Expose({ name: 'RequireUppercaseCharacters' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'requireUppercaseCharacters', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    requireUppercaseCharacters?: Optional<boolean>;
    @Expose({ name: 'RequireLowercaseCharacters' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'requireLowercaseCharacters', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    requireLowercaseCharacters?: Optional<boolean>;
    @Expose({ name: 'AllowUsersToChangePassword' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'allowUsersToChangePassword', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    allowUsersToChangePassword?: Optional<boolean>;
    @Expose({ name: 'ExpirePasswords' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'expirePasswords', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    expirePasswords?: Optional<boolean>;
    @Expose({ name: 'MaxPasswordAge' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'maxPasswordAge', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    maxPasswordAge?: Optional<integer>;
    @Expose({ name: 'PasswordReusePrevention' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'passwordReusePrevention', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    passwordReusePrevention?: Optional<integer>;
    @Expose({ name: 'HardExpiry' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Boolean, 'hardExpiry', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    hardExpiry?: Optional<boolean>;

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

