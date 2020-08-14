// This is a generated file. Modifications will be overwritten.
import { BaseModel, Optional } from 'cfn-rpdk';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;
    public static readonly TYPE_NAME: string = 'OC::Organizations::PasswordPolicy';

    ResourceId: Optional<string>;
    MinimumPasswordLength: Optional<number>;
    RequireSymbols: Optional<boolean>;
    RequireNumbers: Optional<boolean>;
    RequireUppercaseCharacters: Optional<boolean>;
    RequireLowercaseCharacters: Optional<boolean>;
    AllowUsersToChangePassword: Optional<boolean>;
    ExpirePasswords: Optional<boolean>;
    MaxPasswordAge: Optional<number>;
    PasswordReusePrevention: Optional<number>;
    HardExpiry: Optional<boolean>;
}

