# Community::Organizations::EnableAWSServiceAccess

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::Organizations::EnableAWSServiceAccess",
    "Properties" : {
        "<a href="#serviceprincipal" title="ServicePrincipal">ServicePrincipal</a>" : <i>String</i>,
        "<a href="#resourceid" title="ResourceId">ResourceId</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::Organizations::EnableAWSServiceAccess
Properties:
    <a href="#serviceprincipal" title="ServicePrincipal">ServicePrincipal</a>: <i>String</i>
    <a href="#resourceid" title="ResourceId">ResourceId</a>: <i>String</i>
</pre>

## Properties

#### ServicePrincipal

The Service Principal of the AWS Service you wish to enable Delegated Access for

_Required_: Yes

_Type_: String

_Pattern_: <code>.*\.amazonaws\.com</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ResourceId

Primary Identifier for this resource

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.
