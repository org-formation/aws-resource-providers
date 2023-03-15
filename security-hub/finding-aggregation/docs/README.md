# Community::SecurityHub::FindingAggregation

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::SecurityHub::FindingAggregation",
    "Properties" : {
        "<a href="#regionlinkingmode" title="RegionLinkingMode">RegionLinkingMode</a>" : <i>String</i>,
        "<a href="#regions" title="Regions">Regions</a>" : <i>[ String, ... ]</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::SecurityHub::FindingAggregation
Properties:
    <a href="#regionlinkingmode" title="RegionLinkingMode">RegionLinkingMode</a>: <i>String</i>
    <a href="#regions" title="Regions">Regions</a>: <i>
      - String</i>
</pre>

## Properties

#### RegionLinkingMode

Indicates whether to aggregate findings from all of the available Regions in the current partition. Also determines whether to automatically aggregate findings from new Regions as Security Hub supports them and you opt into them.

_Required_: No

_Type_: String

_Allowed Values_: <code>ALL_REGIONS</code> | <code>ALL_REGIONS_EXCEPT_SPECIFIED</code> | <code>SPECIFIED_REGIONS</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Regions

_Required_: No

_Type_: List of String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

Returns the <code>ResourceId</code> value.

