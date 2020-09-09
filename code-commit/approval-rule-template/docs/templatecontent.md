# Community::CodeCommit::ApprovalRuleTemplate TemplateContent

The content of the approval rule template.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#version" title="Version">Version</a>" : <i>String</i>,
    "<a href="#destinationreferences" title="DestinationReferences">DestinationReferences</a>" : <i>String</i>,
    "<a href="#statements" title="Statements">Statements</a>" : <i>[ <a href="statement.md">Statement</a>, ... ]</i>
}
</pre>

### YAML

<pre>
<a href="#version" title="Version">Version</a>: <i>String</i>
<a href="#destinationreferences" title="DestinationReferences">DestinationReferences</a>: <i>String</i>
<a href="#statements" title="Statements">Statements</a>: <i>
      - <a href="statement.md">Statement</a></i>
</pre>

## Properties

#### Version

_Required_: No

_Type_: String

_Allowed Values_: <code>2018-11-08</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### DestinationReferences

Use branch filters to only apply this template to a pull request if the destination branch name matches a name.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Statements

_Required_: No

_Type_: List of <a href="statement.md">Statement</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

