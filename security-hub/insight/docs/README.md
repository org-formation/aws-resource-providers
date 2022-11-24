# Community::SecurityHub::Insight

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::SecurityHub::Insight",
    "Properties" : {
        "<a href="#insightname" title="InsightName">InsightName</a>" : <i>String</i>,
        "<a href="#groupbyattribute" title="GroupByAttribute">GroupByAttribute</a>" : <i>String</i>,
        "<a href="#filtersjson" title="FiltersJSON">FiltersJSON</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::SecurityHub::Insight
Properties:
    <a href="#insightname" title="InsightName">InsightName</a>: <i>String</i>
    <a href="#groupbyattribute" title="GroupByAttribute">GroupByAttribute</a>: <i>String</i>
    <a href="#filtersjson" title="FiltersJSON">FiltersJSON</a>: <i>String</i>
</pre>

## Properties

#### InsightName

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### GroupByAttribute

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### FiltersJSON

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the InsightArn.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### InsightArn

Returns the <code>InsightArn</code> value.

