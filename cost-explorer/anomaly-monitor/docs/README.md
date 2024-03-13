# Community::CostExplorer::AnomalyMonitor

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::CostExplorer::AnomalyMonitor",
    "Properties" : {
        "<a href="#monitorname" title="MonitorName">MonitorName</a>" : <i>String</i>,
        "<a href="#monitortype" title="MonitorType">MonitorType</a>" : <i>String</i>,
        "<a href="#monitordimension" title="MonitorDimension">MonitorDimension</a>" : <i>String</i>,
        "<a href="#monitorspecification" title="MonitorSpecification">MonitorSpecification</a>" : <i>Map</i>,
        "<a href="#dimensionalvaluecount" title="DimensionalValueCount">DimensionalValueCount</a>" : <i>Double</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::CostExplorer::AnomalyMonitor
Properties:
    <a href="#monitorname" title="MonitorName">MonitorName</a>: <i>String</i>
    <a href="#monitortype" title="MonitorType">MonitorType</a>: <i>String</i>
    <a href="#monitordimension" title="MonitorDimension">MonitorDimension</a>: <i>String</i>
    <a href="#monitorspecification" title="MonitorSpecification">MonitorSpecification</a>: <i>Map</i>
    <a href="#dimensionalvaluecount" title="DimensionalValueCount">DimensionalValueCount</a>: <i>Double</i>
</pre>

## Properties

#### MonitorName

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### MonitorType

_Required_: Yes

_Type_: String

_Allowed Values_: <code>DIMENSIONAL</code> | <code>CUSTOM</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### MonitorDimension

_Required_: Yes

_Type_: String

_Allowed Values_: <code>SERVICE</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### MonitorSpecification

_Required_: No

_Type_: Map

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### DimensionalValueCount

_Required_: No

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Arn.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Arn

Returns the <code>Arn</code> value.

