# Community::CodeCommit::ApprovalRuleTemplate

Resource that allows for the creation of approval rule template for CodeCommit.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::CodeCommit::ApprovalRuleTemplate",
    "Properties" : {
        "<a href="#name" title="Name">Name</a>" : <i>String</i>,
        "<a href="#description" title="Description">Description</a>" : <i>String</i>,
        "<a href="#content" title="Content">Content</a>" : <i><a href="templatecontent.md">TemplateContent</a></i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::CodeCommit::ApprovalRuleTemplate
Properties:
    <a href="#name" title="Name">Name</a>: <i>String</i>
    <a href="#description" title="Description">Description</a>: <i>String</i>
    <a href="#content" title="Content">Content</a>: <i><a href="templatecontent.md">TemplateContent</a></i>
</pre>

## Properties

#### Name

The name of the approval rule template. Provide descriptive names, because this name is applied to the approval rules created automatically in associated repositories.

_Required_: Yes

_Type_: String

_Minimum Length_: <code>1</code>

_Maximum Length_: <code>100</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Description

The description of the approval rule template. Consider providing a description that explains what this template does and when it might be appropriate to associate it with repositories.

_Required_: No

_Type_: String

_Minimum Length_: <code>1</code>

_Maximum Length_: <code>1000</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Content

The content of the approval rule template.

_Required_: Yes

_Type_: <a href="templatecontent.md">TemplateContent</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Arn.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Arn

The Amazon Resource Name (ARN) of the approval rule template.

#### Id

The system-generated ID of the approval rule template.

#### CreationDate

The date the approval rule template was created, in POSIX time format.

#### LastModifiedDate

The date the approval rule template was most recently changed, in POSIX time format.

#### LastModifiedUser

The Amazon Resource Name (ARN) of the user who made the most recent changes to the approval rule template.

#### RuleContentSha256

The SHA-256 hash signature for the content of the approval rule template.

