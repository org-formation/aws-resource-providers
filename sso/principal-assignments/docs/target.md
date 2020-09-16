# Community::SSO::PrincipalAssignments Target

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#targettype" title="TargetType">TargetType</a>" : <i>String</i>,
    "<a href="#targetids" title="TargetIds">TargetIds</a>" : <i>[ String, ... ]</i>
}
</pre>

### YAML

<pre>
<a href="#targettype" title="TargetType">TargetType</a>: <i>String</i>
<a href="#targetids" title="TargetIds">TargetIds</a>: <i>
      - String</i>
</pre>

## Properties

#### TargetType

_Required_: Yes

_Type_: String

_Allowed Values_: <code>AWS_ACCOUNT</code> | <code>AWS_OU</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### TargetIds

_Required_: No

_Type_: List of String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

