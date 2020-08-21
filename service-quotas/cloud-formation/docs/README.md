# Community::ServiceQuotas::CloudFormation

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::ServiceQuotas::CloudFormation",
    "Properties" : {
        "<a href="#stacks" title="Stacks">Stacks</a>" : <i>Integer</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::ServiceQuotas::CloudFormation
Properties:
    <a href="#stacks" title="Stacks">Stacks</a>: <i>Integer</i>
</pre>

## Properties

#### Stacks

Maximum number of AWS CloudFormation stacks that you can create (default = 200).

_Required_: No

_Type_: Integer

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

Returns the <code>ResourceId</code> value.

