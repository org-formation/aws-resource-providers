# Community::Organizations::Policy

Resource that allows for the creation of an Organizations Policy attached to an OU.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::Organizations::Policy",
    "Properties" : {
        "<a href="#content" title="Content">Content</a>" : <i>String</i>,
        "<a href="#description" title="Description">Description</a>" : <i>String</i>,
        "<a href="#name" title="Name">Name</a>" : <i>String</i>,
        "<a href="#policytype" title="PolicyType">PolicyType</a>" : <i>String</i>,
        "<a href="#targetids" title="TargetIds">TargetIds</a>" : <i>[ String, ... ]</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::Organizations::Policy
Properties:
    <a href="#content" title="Content">Content</a>: <i>String</i>
    <a href="#description" title="Description">Description</a>: <i>String</i>
    <a href="#name" title="Name">Name</a>: <i>String</i>
    <a href="#policytype" title="PolicyType">PolicyType</a>: <i>String</i>
    <a href="#targetids" title="TargetIds">TargetIds</a>: <i>
      - String</i>
</pre>

## Properties

#### Content

The policy text content to add to the new policy. The text that you supply must adhere to the rules of the policy type you specify in the Type parameter.

_Required_: Yes

_Type_: String

_Minimum_: <code>1</code>

_Maximum_: <code>1000000</code>

_Pattern_: <code>[\s\S]+</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Description

An optional description to assign to the policy.

_Required_: Yes

_Type_: String

_Maximum_: <code>512</code>

_Pattern_: <code>[\s\S]*</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Name

The friendly name to assign to the policy.

_Required_: Yes

_Type_: String

_Minimum_: <code>1</code>

_Maximum_: <code>128</code>

_Pattern_: <code>[\s\S]+</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### PolicyType

The type of policy to create.

_Required_: Yes

_Type_: String

_Allowed Values_: <code>AISERVICES_OPT_OUT_POLICY</code> | <code>BACKUP_POLICY</code> | <code>SERVICE_CONTROL_POLICY</code> | <code>TAG_POLICY</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### TargetIds

The list of target IDs to attach the policy to.

_Required_: Yes

_Type_: List of String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

The unique identifier (ID) of the policy.

