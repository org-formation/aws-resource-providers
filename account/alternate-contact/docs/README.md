# Community::Account::AlternateContact

Community type to manage account alternate contacts

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::Account::AlternateContact",
    "Properties" : {
        "<a href="#alternatecontacttype" title="AlternateContactType">AlternateContactType</a>" : <i>String</i>,
        "<a href="#name" title="Name">Name</a>" : <i>String</i>,
        "<a href="#emailaddress" title="EmailAddress">EmailAddress</a>" : <i>String</i>,
        "<a href="#phonenumber" title="PhoneNumber">PhoneNumber</a>" : <i>String</i>,
        "<a href="#title" title="Title">Title</a>" : <i>String</i>,
        "<a href="#accountid" title="AccountId">AccountId</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::Account::AlternateContact
Properties:
    <a href="#alternatecontacttype" title="AlternateContactType">AlternateContactType</a>: <i>String</i>
    <a href="#name" title="Name">Name</a>: <i>String</i>
    <a href="#emailaddress" title="EmailAddress">EmailAddress</a>: <i>String</i>
    <a href="#phonenumber" title="PhoneNumber">PhoneNumber</a>: <i>String</i>
    <a href="#title" title="Title">Title</a>: <i>String</i>
    <a href="#accountid" title="AccountId">AccountId</a>: <i>String</i>
</pre>

## Properties

#### AlternateContactType

_Required_: Yes

_Type_: String

_Allowed Values_: <code>BILLING</code> | <code>OPERATIONS</code> | <code>SECURITY</code>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Name

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### EmailAddress

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### PhoneNumber

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Title

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### AccountId

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the AlternateContactType.
