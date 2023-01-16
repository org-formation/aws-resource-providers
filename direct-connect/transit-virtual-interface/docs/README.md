# Community::DirectConnect::TransitVirtualInterface

Provisions a virtual interface VIF on a direct connect gateway.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::DirectConnect::TransitVirtualInterface",
    "Properties" : {
        "<a href="#connectionid" title="ConnectionId">ConnectionId</a>" : <i>String</i>,
        "<a href="#virtualinterfacename" title="VirtualInterfaceName">VirtualInterfaceName</a>" : <i>String</i>,
        "<a href="#asn" title="Asn">Asn</a>" : <i>Double</i>,
        "<a href="#mtu" title="Mtu">Mtu</a>" : <i>Double</i>,
        "<a href="#authkey" title="AuthKey">AuthKey</a>" : <i>String</i>,
        "<a href="#amazonaddress" title="AmazonAddress">AmazonAddress</a>" : <i>String</i>,
        "<a href="#customeraddress" title="CustomerAddress">CustomerAddress</a>" : <i>String</i>,
        "<a href="#addressfamily" title="AddressFamily">AddressFamily</a>" : <i>String</i>,
        "<a href="#directconnectgatewayid" title="DirectConnectGatewayId">DirectConnectGatewayId</a>" : <i>String</i>,
        "<a href="#enablesitelink" title="EnableSiteLink">EnableSiteLink</a>" : <i>Boolean</i>,
        "<a href="#tags" title="Tags">Tags</a>" : <i>[ <a href="tag.md">Tag</a>, ... ]</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::DirectConnect::TransitVirtualInterface
Properties:
    <a href="#connectionid" title="ConnectionId">ConnectionId</a>: <i>String</i>
    <a href="#virtualinterfacename" title="VirtualInterfaceName">VirtualInterfaceName</a>: <i>String</i>
    <a href="#asn" title="Asn">Asn</a>: <i>Double</i>
    <a href="#mtu" title="Mtu">Mtu</a>: <i>Double</i>
    <a href="#authkey" title="AuthKey">AuthKey</a>: <i>String</i>
    <a href="#amazonaddress" title="AmazonAddress">AmazonAddress</a>: <i>String</i>
    <a href="#customeraddress" title="CustomerAddress">CustomerAddress</a>: <i>String</i>
    <a href="#addressfamily" title="AddressFamily">AddressFamily</a>: <i>String</i>
    <a href="#directconnectgatewayid" title="DirectConnectGatewayId">DirectConnectGatewayId</a>: <i>String</i>
    <a href="#enablesitelink" title="EnableSiteLink">EnableSiteLink</a>: <i>Boolean</i>
    <a href="#tags" title="Tags">Tags</a>: <i>
      - <a href="tag.md">Tag</a></i>
</pre>

## Properties

#### ConnectionId

The ID of the direct connect connection.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### VirtualInterfaceName

The name of the virtual interface assigned by the customer network. The name has a maximum of 100 characters. The following are valid characters: a-z, 0-9 and a hyphen (-).

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Asn

The autonomous system (AS) number for Border Gateway Protocol (BGP) configuration. The valid values are 1-2147483647

_Required_: Yes

_Type_: Double

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Mtu

The maximum transmission unit (MTU), in bytes. The supported values are 1500 and 9001. The default value is 1500.

_Required_: No

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### AuthKey

The authentication key for BGP configuration. This string has a minimum length of 6 characters and and a maximun lenth of 80 characters.

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### AmazonAddress

The IP address assigned to the Amazon interface.

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### CustomerAddress

The IP address assigned to the customer interface.

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### AddressFamily

The address family for the BGP peer.

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### DirectConnectGatewayId

The ID of the Direct Connect gateway.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### EnableSiteLink

Indicates whether to enable or disable SiteLink.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Tags

An array of key-value pairs to apply to this resource.

_Required_: No

_Type_: List of <a href="tag.md">Tag</a>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the VirtualInterfaceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Vlan

The ID of the VLAN.

#### VirtualInterfaceId

Identifier of the Transit Virtual Interface

#### OwnerAccount

The ID of the Amazon Web Services account that owns the Direct Connect gateway.

#### VirtualInterfaceState

The state of the virtual interface.

#### Arn

The ARN of the Transit Virtual Interface.

