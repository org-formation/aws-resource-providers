# Community::SecurityHub::Hub

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::SecurityHub::Hub",
    "Properties" : {
        "<a href="#enabledefaultstandards" title="EnableDefaultStandards">EnableDefaultStandards</a>" : <i>Boolean</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::SecurityHub::Hub
Properties:
    <a href="#enabledefaultstandards" title="EnableDefaultStandards">EnableDefaultStandards</a>: <i>Boolean</i>
</pre>

## Properties

#### EnableDefaultStandards

_Required_: No

_Type_: Boolean

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

Returns the <code>ResourceId</code> value.

