# Community::DirectConnect::Gateway

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::DirectConnect::Gateway",
    "Properties" : {
        "<a href="#directconnectgatewayname" title="DirectConnectGatewayName">DirectConnectGatewayName</a>" : <i>String</i>,
        "<a href="#amazonsideasn" title="AmazonSideAsn">AmazonSideAsn</a>" : <i>Double</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::DirectConnect::Gateway
Properties:
    <a href="#directconnectgatewayname" title="DirectConnectGatewayName">DirectConnectGatewayName</a>: <i>String</i>
    <a href="#amazonsideasn" title="AmazonSideAsn">AmazonSideAsn</a>: <i>Double</i>
</pre>

## Properties

#### DirectConnectGatewayName

The name of the Direct Connect gateway.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### AmazonSideAsn

The autonomous system number (ASN) for Border Gateway Protocol (BGP) to be configured on the Amazon side of the connection. The ASN must be in the private range of 64,512 to 65,534.

_Required_: Yes

_Type_: Double

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the DirectConnectGatewayId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### DirectConnectGatewayId

The ID of the Direct Connect gateway.

#### OwnerAccount

The ID of the Amazon Web Services account that owns the Direct Connect gateway.

