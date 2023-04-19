# Community::SecurityHub::SecurityControl

Resource that allows  management of Security Hub Security Controls

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::SecurityHub::SecurityControl",
    "Properties" : {
        "<a href="#controlid" title="ControlId">ControlId</a>" : <i>String</i>,
        "<a href="#suppressionsupdatedby" title="SuppressionsUpdatedBy">SuppressionsUpdatedBy</a>" : <i>String</i>,
        "<a href="#suppresscurrentfindingsondisabled" title="SuppressCurrentFindingsOnDisabled">SuppressCurrentFindingsOnDisabled</a>" : <i>Boolean</i>,
        "<a href="#controlstatus" title="ControlStatus">ControlStatus</a>" : <i>String</i>,
        "<a href="#disabledreason" title="DisabledReason">DisabledReason</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::SecurityHub::SecurityControl
Properties:
    <a href="#controlid" title="ControlId">ControlId</a>: <i>String</i>
    <a href="#suppressionsupdatedby" title="SuppressionsUpdatedBy">SuppressionsUpdatedBy</a>: <i>String</i>
    <a href="#suppresscurrentfindingsondisabled" title="SuppressCurrentFindingsOnDisabled">SuppressCurrentFindingsOnDisabled</a>: <i>Boolean</i>
    <a href="#controlstatus" title="ControlStatus">ControlStatus</a>: <i>String</i>
    <a href="#disabledreason" title="DisabledReason">DisabledReason</a>: <i>String</i>
</pre>

## Properties

#### ControlId

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### SuppressionsUpdatedBy

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### SuppressCurrentFindingsOnDisabled

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ControlStatus

_Required_: Yes

_Type_: String

_Allowed Values_: <code>ENABLED</code> | <code>DISABLED</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### DisabledReason

The description for the custom action target.

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ControlId.
