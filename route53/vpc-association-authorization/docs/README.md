# Community::Route53::VPCAssociationAuthorization

Creates a VPC Association Authorization.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::Route53::VPCAssociationAuthorization",
    "Properties" : {
        "<a href="#hostedzoneid" title="HostedZoneId">HostedZoneId</a>" : <i>String</i>,
        "<a href="#vpc" title="VPC">VPC</a>" : <i><a href="vpc.md">VPC</a></i>
    }
}
</pre>

### YAML

<pre>
Type: Community::Route53::VPCAssociationAuthorization
Properties:
    <a href="#hostedzoneid" title="HostedZoneId">HostedZoneId</a>: <i>String</i>
    <a href="#vpc" title="VPC">VPC</a>: <i><a href="vpc.md">VPC</a></i>
</pre>

## Properties

#### HostedZoneId

The ID of the private hosted zone that you want to authorize associating a VPC with.

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### VPC

A complex type that contains the VPC ID and region for the VPC that you want to authorize associating with your hosted zone.

_Required_: Yes

_Type_: <a href="vpc.md">VPC</a>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

The ID of this resource.

