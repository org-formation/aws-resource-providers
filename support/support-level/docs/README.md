# Community::Support::SupportLevel

Resource that allows settings the SupportLevel for an Account within the organization through a support ticket. Only works if the master account has either business or enterprise support

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::Support::SupportLevel",
    "Properties" : {
        "<a href="#accountid" title="AccountId">AccountId</a>" : <i>String</i>,
        "<a href="#disablesupportcasecreation" title="DisableSupportCaseCreation">DisableSupportCaseCreation</a>" : <i>Boolean</i>,
        "<a href="#supportlevel" title="SupportLevel">SupportLevel</a>" : <i>String</i>,
        "<a href="#ccemailaddresses" title="CCEmailAddresses">CCEmailAddresses</a>" : <i>[ String, ... ]</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::Support::SupportLevel
Properties:
    <a href="#accountid" title="AccountId">AccountId</a>: <i>String</i>
    <a href="#disablesupportcasecreation" title="DisableSupportCaseCreation">DisableSupportCaseCreation</a>: <i>Boolean</i>
    <a href="#supportlevel" title="SupportLevel">SupportLevel</a>: <i>String</i>
    <a href="#ccemailaddresses" title="CCEmailAddresses">CCEmailAddresses</a>: <i>
      - String</i>
</pre>

## Properties

#### AccountId

_Required_: Yes

_Type_: String

_Pattern_: <code>^[\d]{12}$</code>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### DisableSupportCaseCreation

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### SupportLevel

_Required_: Yes

_Type_: String

_Allowed Values_: <code>developer</code> | <code>business</code> | <code>enterprise</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### CCEmailAddresses

_Required_: No

_Type_: List of String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Arn.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Arn

Returns the <code>Arn</code> value.

