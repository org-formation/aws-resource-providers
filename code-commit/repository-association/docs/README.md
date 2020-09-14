# Community::CodeCommit::RepositoryAssociation

Resource that allows for the association of a particular approval rule template to CodeCommit repositories.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::CodeCommit::RepositoryAssociation",
    "Properties" : {
        "<a href="#repositorynames" title="RepositoryNames">RepositoryNames</a>" : <i>[ String, ... ]</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::CodeCommit::RepositoryAssociation
Properties:
    <a href="#repositorynames" title="RepositoryNames">RepositoryNames</a>: <i>
      - String</i>
</pre>

## Properties

#### RepositoryNames

A list of repository names that are associated with the specified approval rule template.

_Required_: Yes

_Type_: List of String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Arn.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Arn

The Amazon Resource Name (ARN) of the template repository association.

#### ApprovalRuleTemplateName

The name of the approval rule template for which you want to list repositories that are associated with that template.

