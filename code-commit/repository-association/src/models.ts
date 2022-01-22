// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::CodeCommit::RepositoryAssociation';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ARN: string = '/properties/Arn';

    @Expose({ name: 'Arn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'arn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    arn?: Optional<string>;
    @Expose({ name: 'ApprovalRuleTemplateArn' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'approvalRuleTemplateArn', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    approvalRuleTemplateArn?: Optional<string>;
    @Expose({ name: 'ApprovalRuleTemplateName' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'approvalRuleTemplateName', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    approvalRuleTemplateName?: Optional<string>;
    @Expose({ name: 'RepositoryNames' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'repositoryNames', value, obj, [Array]),
        {
            toClassOnly: true,
        }
    )
    repositoryNames?: Optional<Array<string>>;

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

