// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::Organizations::DelegatedAdmin';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ARN: string = '/properties/Arn';

    @Expose({ name: 'AccountId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'accountId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    accountId?: Optional<string>;
    @Expose({ name: 'ServicePrincipal' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'servicePrincipal', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    servicePrincipal?: Optional<string>;
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
        if (this.arn != null) {
            identifier[this.IDENTIFIER_KEY_ARN] = this.arn;
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

