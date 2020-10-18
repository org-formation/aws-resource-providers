// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::CodeCommit::ApprovalRuleTemplate';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ARN: string = '/properties/Arn';
    @Exclude()
    protected readonly IDENTIFIER_KEY_ID: string = '/properties/Id';
    @Exclude()
    protected readonly IDENTIFIER_KEY_NAME: string = '/properties/Name';

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
    @Expose({ name: 'Name' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'name', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    name?: Optional<string>;
    @Expose({ name: 'Description' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'description', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    description?: Optional<string>;
    @Expose({ name: 'Content' })
    @Type(() => TemplateContent)
    content?: Optional<TemplateContent>;
    @Expose({ name: 'CreationDate' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'creationDate', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    creationDate?: Optional<number>;
    @Expose({ name: 'LastModifiedDate' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Number, 'lastModifiedDate', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    lastModifiedDate?: Optional<number>;
    @Expose({ name: 'LastModifiedUser' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'lastModifiedUser', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    lastModifiedUser?: Optional<string>;
    @Expose({ name: 'RuleContentSha256' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'ruleContentSha256', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    ruleContentSha256?: Optional<string>;

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
        if (this.getIdentifier_Name() != null) {
            identifiers.push(this.getIdentifier_Name());
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

    @Exclude()
    public getIdentifier_Name(): Dict {
        const identifier: Dict = {};
        if ((this as any).name != null) {
            identifier[this.IDENTIFIER_KEY_NAME] = (this as any).name;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }
}

export class TemplateContent extends BaseModel {
    ['constructor']: typeof TemplateContent;


    @Expose({ name: 'Version' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'version', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    version?: Optional<string>;
    @Expose({ name: 'DestinationReferences' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'destinationReferences', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    destinationReferences?: Optional<Array<string>>;
    @Expose({ name: 'Statements' })
    @Type(() => Statement)
    statements?: Optional<Array<Statement>>;

}

export class Statement extends BaseModel {
    ['constructor']: typeof Statement;


    @Expose({ name: 'Type' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'type_', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    type_?: Optional<string>;
    @Expose({ name: 'NumberOfApprovalsNeeded' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(Integer, 'numberOfApprovalsNeeded', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    numberOfApprovalsNeeded?: Optional<integer>;
    @Expose({ name: 'ApprovalPoolMembers' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'approvalPoolMembers', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    approvalPoolMembers?: Optional<Array<string>>;

}

