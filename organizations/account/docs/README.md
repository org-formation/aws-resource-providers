# Community::Organizations::Account

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::Organizations::Account",
    "Properties" : {
        "<a href="#accountname" title="AccountName">AccountName</a>" : <i>String</i>,
        "<a href="#rootemail" title="RootEmail">RootEmail</a>" : <i>String</i>,
        "<a href="#alias" title="Alias">Alias</a>" : <i>String</i>,
        "<a href="#supportlevel" title="SupportLevel">SupportLevel</a>" : <i>String</i>,
        "<a href="#organizationaccessrolename" title="OrganizationAccessRoleName">OrganizationAccessRoleName</a>" : <i>String</i>,
        "<a href="#parentou" title="ParentOU">ParentOU</a>" : <i>String</i>,
        "<a href="#policies" title="Policies">Policies</a>" : <i>[ String, ... ]</i>,
        "<a href="#arn" title="Arn">Arn</a>" : <i>String</i>,
        "<a href="#id" title="Id">Id</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::Organizations::Account
Properties:
    <a href="#accountname" title="AccountName">AccountName</a>: <i>String</i>
    <a href="#rootemail" title="RootEmail">RootEmail</a>: <i>String</i>
    <a href="#alias" title="Alias">Alias</a>: <i>String</i>
    <a href="#supportlevel" title="SupportLevel">SupportLevel</a>: <i>String</i>
    <a href="#organizationaccessrolename" title="OrganizationAccessRoleName">OrganizationAccessRoleName</a>: <i>String</i>
    <a href="#parentou" title="ParentOU">ParentOU</a>: <i>String</i>
    <a href="#policies" title="Policies">Policies</a>: <i>
      - String</i>
    <a href="#arn" title="Arn">Arn</a>: <i>String</i>
    <a href="#id" title="Id">Id</a>: <i>String</i>
</pre>

## Properties

#### AccountName

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RootEmail

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Alias

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### SupportLevel

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### OrganizationAccessRoleName

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ParentOU

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Policies

_Required_: No

_Type_: List of String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Arn

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Id

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Arn.
