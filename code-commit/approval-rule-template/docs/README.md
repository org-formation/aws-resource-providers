# Community::CodeCommit::ApprovalRuleTemplate

Detailed information about an approval rule template for CodeCommit

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::CodeCommit::ApprovalRuleTemplate",
    "Properties" : {
        "<a href="#approvalruletemplateid" title="approvalRuleTemplateId">approvalRuleTemplateId</a>" : <i>String</i>,
        "<a href="#approvalruletemplatename" title="approvalRuleTemplateName">approvalRuleTemplateName</a>" : <i>String</i>,
        "<a href="#approvalruletemplatedescription" title="approvalRuleTemplateDescription">approvalRuleTemplateDescription</a>" : <i>String</i>,
        "<a href="#approvalruletemplatecontent" title="approvalRuleTemplateContent">approvalRuleTemplateContent</a>" : <i><a href="templatecontent.md">TemplateContent</a></i>,
        "<a href="#creationdate" title="creationDate">creationDate</a>" : <i>String</i>,
        "<a href="#lastmodifieddate" title="lastModifiedDate">lastModifiedDate</a>" : <i>String</i>,
        "<a href="#lastmodifieduser" title="lastModifiedUser">lastModifiedUser</a>" : <i>String</i>,
        "<a href="#rulecontentsha256" title="ruleContentSha256">ruleContentSha256</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::CodeCommit::ApprovalRuleTemplate
Properties:
    <a href="#approvalruletemplateid" title="approvalRuleTemplateId">approvalRuleTemplateId</a>: <i>String</i>
    <a href="#approvalruletemplatename" title="approvalRuleTemplateName">approvalRuleTemplateName</a>: <i>String</i>
    <a href="#approvalruletemplatedescription" title="approvalRuleTemplateDescription">approvalRuleTemplateDescription</a>: <i>String</i>
    <a href="#approvalruletemplatecontent" title="approvalRuleTemplateContent">approvalRuleTemplateContent</a>: <i><a href="templatecontent.md">TemplateContent</a></i>
    <a href="#creationdate" title="creationDate">creationDate</a>: <i>String</i>
    <a href="#lastmodifieddate" title="lastModifiedDate">lastModifiedDate</a>: <i>String</i>
    <a href="#lastmodifieduser" title="lastModifiedUser">lastModifiedUser</a>: <i>String</i>
    <a href="#rulecontentsha256" title="ruleContentSha256">ruleContentSha256</a>: <i>String</i>
</pre>

## Properties

#### approvalRuleTemplateId

The system-generated ID of the approval rule template.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### approvalRuleTemplateName

The name of the approval rule template. Provide descriptive names, because this name is applied to the approval rules created automatically in associated repositories.

_Required_: No

_Type_: String

_Minimum_: <code>1</code>

_Maximum_: <code>100</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### approvalRuleTemplateDescription

The description of the approval rule template. Consider providing a description that explains what this template does and when it might be appropriate to associate it with repositories.

_Required_: No

_Type_: String

_Maximum_: <code>1000</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### approvalRuleTemplateContent

The content of the approval rule template.

_Required_: No

_Type_: <a href="templatecontent.md">TemplateContent</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### creationDate

The date the approval rule template was created, in timestamp format.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### lastModifiedDate

The date the approval rule template was most recently changed, in timestamp format.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### lastModifiedUser

The Amazon Resource Name (ARN) of the user who made the most recent changes to the approval rule template.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ruleContentSha256

The SHA-256 hash signature for the content of the approval rule template.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ApprovalRuleTemplateId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ApprovalRuleTemplateId

Returns the <code>ApprovalRuleTemplateId</code> value.

#### CreationDate

Returns the <code>CreationDate</code> value.

#### LastModifiedDate

Returns the <code>LastModifiedDate</code> value.

#### LastModifiedUser

Returns the <code>LastModifiedUser</code> value.

#### RuleContentSha256

Returns the <code>RuleContentSha256</code> value.

#### Version

Returns the <code>Version</code> value.

