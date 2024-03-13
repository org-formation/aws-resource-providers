# Community::CostExplorer::AnomalySubscription

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::CostExplorer::AnomalySubscription",
    "Properties" : {
        "<a href="#accountid" title="AccountId">AccountId</a>" : <i>String</i>,
        "<a href="#monitorarnlist" title="MonitorArnList">MonitorArnList</a>" : <i>[ String, ... ]</i>,
        "<a href="#subscribers" title="Subscribers">Subscribers</a>" : <i>[ <a href="subscriber.md">Subscriber</a>, ... ]</i>,
        "<a href="#threshold" title="Threshold">Threshold</a>" : <i>Double</i>,
        "<a href="#frequency" title="Frequency">Frequency</a>" : <i>String</i>,
        "<a href="#subscriptionname" title="SubscriptionName">SubscriptionName</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::CostExplorer::AnomalySubscription
Properties:
    <a href="#accountid" title="AccountId">AccountId</a>: <i>String</i>
    <a href="#monitorarnlist" title="MonitorArnList">MonitorArnList</a>: <i>
      - String</i>
    <a href="#subscribers" title="Subscribers">Subscribers</a>: <i>
      - <a href="subscriber.md">Subscriber</a></i>
    <a href="#threshold" title="Threshold">Threshold</a>: <i>Double</i>
    <a href="#frequency" title="Frequency">Frequency</a>: <i>String</i>
    <a href="#subscriptionname" title="SubscriptionName">SubscriptionName</a>: <i>String</i>
</pre>

## Properties

#### AccountId

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### MonitorArnList

_Required_: No

_Type_: List of String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Subscribers

_Required_: No

_Type_: List of <a href="subscriber.md">Subscriber</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Threshold

_Required_: Yes

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Frequency

_Required_: Yes

_Type_: String

_Allowed Values_: <code>DAILY</code> | <code>IMMEDIATE</code> | <code>WEEKLY</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### SubscriptionName

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Arn.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Arn

Returns the <code>Arn</code> value.

