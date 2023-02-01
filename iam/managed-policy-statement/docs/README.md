# Community::IAM::ManagedPolicyStatement

a CloudFormation resource that allows you to manage a (single) statement within a managed policy.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::IAM::ManagedPolicyStatement",
    "Properties" : {
        "<a href="#statementid" title="StatementId">StatementId</a>" : <i>String</i>,
        "<a href="#statementjson" title="StatementJson">StatementJson</a>" : <i>String</i>,
        "<a href="#managedpolicyname" title="ManagedPolicyName">ManagedPolicyName</a>" : <i>String</i>,
        "<a href="#managedpolicypath" title="ManagedPolicyPath">ManagedPolicyPath</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::IAM::ManagedPolicyStatement
Properties:
    <a href="#statementid" title="StatementId">StatementId</a>: <i>String</i>
    <a href="#statementjson" title="StatementJson">StatementJson</a>: <i>String</i>
    <a href="#managedpolicyname" title="ManagedPolicyName">ManagedPolicyName</a>: <i>String</i>
    <a href="#managedpolicypath" title="ManagedPolicyPath">ManagedPolicyPath</a>: <i>String</i>
</pre>

## Properties

#### StatementId

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### StatementJson

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ManagedPolicyName

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### ManagedPolicyPath

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

Returns the <code>ResourceId</code> value.

