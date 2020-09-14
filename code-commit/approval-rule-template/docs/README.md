# Community::CodeCommit::ApprovalRuleTemplate

Resource that allows for the creation of approval rule template for CodeCommit.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::CodeCommit::ApprovalRuleTemplate",
    "Properties" : {
        "<a href="#approvalruletemplatedescription" title="ApprovalRuleTemplateDescription">ApprovalRuleTemplateDescription</a>" : <i>String</i>,
        "<a href="#approvalruletemplatecontent" title="ApprovalRuleTemplateContent">ApprovalRuleTemplateContent</a>" : <i><a href="templatecontent.md">TemplateContent</a></i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::CodeCommit::ApprovalRuleTemplate
Properties:
    <a href="#approvalruletemplatedescription" title="ApprovalRuleTemplateDescription">ApprovalRuleTemplateDescription</a>: <i>String</i>
    <a href="#approvalruletemplatecontent" title="ApprovalRuleTemplateContent">ApprovalRuleTemplateContent</a>: <i><a href="templatecontent.md">TemplateContent</a></i>
</pre>

## Properties

#### ApprovalRuleTemplateDescription

The description of the approval rule template. Consider providing a description that explains what this template does and when it might be appropriate to associate it with repositories.

_Required_: No

_Type_: String

_Maximum_: <code>1000</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ApprovalRuleTemplateContent

The content of the approval rule template.

_Required_: Yes

_Type_: <a href="templatecontent.md">TemplateContent</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ApprovalRuleTemplateId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ApprovalRuleTemplateId

The system-generated ID of the approval rule template.

#### ApprovalRuleTemplateName

The name of the approval rule template. Provide descriptive names, because this name is applied to the approval rules created automatically in associated repositories.

#### CreationDate

The date the approval rule template was created, in timestamp format.

#### LastModifiedDate

The date the approval rule template was most recently changed, in timestamp format.

#### LastModifiedUser

The Amazon Resource Name (ARN) of the user who made the most recent changes to the approval rule template.

#### RuleContentSha256

The SHA-256 hash signature for the content of the approval rule template.

