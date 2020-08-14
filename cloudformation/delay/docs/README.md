# OC::CloudFormation::Delay

Resource schema for OC::CloudFormation::Delay.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "OC::CloudFormation::Delay",
    "Properties" : {
        "<a href="#duration" title="Duration">Duration</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: OC::CloudFormation::Delay
Properties:
    <a href="#duration" title="Duration">Duration</a>: <i>String</i>
</pre>

## Properties

#### Duration

The length of time that AWS CloudFormation waits. The maximum time that you can specify is 12 hours. The value must be in ISO8601 duration format, in the form: "PT#H#M#S", where each # is the number of hours, minutes, and seconds, respectively.

_Required_: No

_Type_: String

_Pattern_: <code>^PT(?=[0-9])([0-1]?[0-9]H)?([0-9]+M)?([0-9]+S)?$</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

AWS CloudFormation generates a unique identifier for the delay resource.

