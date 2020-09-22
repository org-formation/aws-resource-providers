// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from 'cfn-rpdk';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::CodeCommit::ApprovalRuleTemplate';

    @Exclude()
    protected readonly IDENTIFIER_KEY_APPROVALRULETEMPLATEID: string = '/properties/ApprovalRuleTemplateId';
    @Exclude()
    protected readonly IDENTIFIER_KEY_APPROVALRULETEMPLATENAME: string = '/properties/ApprovalRuleTemplateName';

    @Expose({ name: 'ApprovalRuleTemplateId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'approvalRuleTemplateId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    approvalRuleTemplateId?: Optional<string>;
    @Expose({ name: 'ApprovalRuleTemplateName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'approvalRuleTemplateName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    approvalRuleTemplateName?: Optional<string>;
    @Expose({ name: 'ApprovalRuleTemplateDescription' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'approvalRuleTemplateDescription', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    approvalRuleTemplateDescription?: Optional<string>;
    @Expose({ name: 'ApprovalRuleTemplateContent' })
    @Type(() => TemplateContent)
    approvalRuleTemplateContent?: Optional<TemplateContent>;
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
        if (this.approvalRuleTemplateId != null) {
            identifier[this.IDENTIFIER_KEY_APPROVALRULETEMPLATEID] = this.approvalRuleTemplateId;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        if (this.getIdentifier_ApprovalRuleTemplateName() != null) {
            identifiers.push(this.getIdentifier_ApprovalRuleTemplateName());
        }
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }

    @Exclude()
    public getIdentifier_ApprovalRuleTemplateName(): Dict {
        const identifier: Dict = {};
        if ((this as any).approvalRuleTemplateName != null) {
            identifier[this.IDENTIFIER_KEY_APPROVALRULETEMPLATENAME] = (this as any).approvalRuleTemplateName;
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
            transformValue(String, 'destinationReferences', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    destinationReferences?: Optional<string>;
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

