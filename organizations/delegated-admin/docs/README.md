# Community::Organizations::DelegatedAdmin

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::Organizations::DelegatedAdmin",
    "Properties" : {
        "<a href="#accountid" title="AccountId">AccountId</a>" : <i>String</i>,
        "<a href="#serviceprincipal" title="ServicePrincipal">ServicePrincipal</a>" : <i>String</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::Organizations::DelegatedAdmin
Properties:
    <a href="#accountid" title="AccountId">AccountId</a>: <i>String</i>
    <a href="#serviceprincipal" title="ServicePrincipal">ServicePrincipal</a>: <i>String</i>
</pre>

## Properties

#### AccountId

The AWS Account to delegated service to

_Required_: Yes

_Type_: String

_Pattern_: <code>^[0-9]{12}$</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ServicePrincipal

The Service Principal of the AWS Service you wish to enable Delegated Access for

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

