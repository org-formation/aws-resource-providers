# Community::Route53::VPCAssociationAuthorization VPC

A complex type that contains the VPC ID and region for the VPC that you want to authorize associating with your hosted zone.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#vpcregion" title="VPCRegion">VPCRegion</a>" : <i>String</i>,
    "<a href="#vpcid" title="VPCId">VPCId</a>" : <i>String</i>
}
</pre>

### YAML

<pre>
<a href="#vpcregion" title="VPCRegion">VPCRegion</a>: <i>String</i>
<a href="#vpcid" title="VPCId">VPCId</a>: <i>String</i>
</pre>

## Properties

#### VPCRegion

The region that an Amazon VPC was created in.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### VPCId

The ID of an Amazon VPC.

_Required_: Yes

_Type_: String

_Maximum_: <code>32</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

