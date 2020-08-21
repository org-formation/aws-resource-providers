// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::Organizations::OrganizationalUnit';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ARN: string = '/properties/Arn';
    @Exclude()
    protected readonly IDENTIFIER_KEY_ID: string = '/properties/Id';

    @Expose({ name: 'OrganizationalUnitName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'organizationalUnitName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    organizationalUnitName?: Optional<string>;
    @Expose({ name: 'Policies' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'policies', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    policies?: Optional<Array<string>>;
    @Expose({ name: 'ParentOU' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'parentOU', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    parentOU?: Optional<string>;
    @Expose({ name: 'Arn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'arn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    arn?: Optional<string>;
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
        if (this.arn != null) {
            identifier[this.IDENTIFIER_KEY_ARN] = this.arn;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        if (this.getIdentifier_Id() != null) {
            identifiers.push(this.getIdentifier_Id());
        }
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }

    @Exclude()
    public getIdentifier_Id(): Dict {
        const identifier: Dict = {};
        if ((this as any).id != null) {
            identifier[this.IDENTIFIER_KEY_ID] = (this as any).id;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }
}

