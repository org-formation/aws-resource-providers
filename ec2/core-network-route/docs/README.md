# Community::EC2::CoreNetworkRoute

An AWS::EC2::Route connected to a AWS::NetworkManager::CoreNetwork

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::EC2::CoreNetworkRoute",
    "Properties" : {
        "<a href="#destinationcidrblock" title="DestinationCidrBlock">DestinationCidrBlock</a>" : <i>String</i>,
        "<a href="#routetableid" title="RouteTableId">RouteTableId</a>" : <i>String</i>,
        "<a href="#vpcattachmentid" title="VpcAttachmentId">VpcAttachmentId</a>" : <i>String</i>,
        "<a href="#corenetworkarn" title="CoreNetworkArn">CoreNetworkArn</a>" : <i>String</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::EC2::CoreNetworkRoute
Properties:
    <a href="#destinationcidrblock" title="DestinationCidrBlock">DestinationCidrBlock</a>: <i>String</i>
    <a href="#routetableid" title="RouteTableId">RouteTableId</a>: <i>String</i>
    <a href="#vpcattachmentid" title="VpcAttachmentId">VpcAttachmentId</a>: <i>String</i>
    <a href="#corenetworkarn" title="CoreNetworkArn">CoreNetworkArn</a>: <i>String</i>
</pre>

## Properties

#### DestinationCidrBlock

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### RouteTableId

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### VpcAttachmentId

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### CoreNetworkArn

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Id.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Id

Returns the <code>Id</code> value.

