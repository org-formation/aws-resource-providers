# Community::SecurityHub::Master

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::SecurityHub::Master",
    "Properties" : {
        "<a href="#masteraccountid" title="MasterAccountId">MasterAccountId</a>" : <i>String</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::SecurityHub::Master
Properties:
    <a href="#masteraccountid" title="MasterAccountId">MasterAccountId</a>: <i>String</i>
</pre>

## Properties

#### MasterAccountId

AccountId of the master account this account would like to be part of.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

Returns the <code>ResourceId</code> value.

