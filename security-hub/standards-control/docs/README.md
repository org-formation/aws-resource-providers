# Community::SecurityHub::StandardsControl

Resource that allows  management of Security Hub Standards Controls

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::SecurityHub::StandardsControl",
    "Properties" : {
        "<a href="#standardcode" title="StandardCode">StandardCode</a>" : <i>String</i>,
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
Type: Community::SecurityHub::StandardsControl
Properties:
    <a href="#standardcode" title="StandardCode">StandardCode</a>: <i>String</i>
    <a href="#controlid" title="ControlId">ControlId</a>: <i>String</i>
    <a href="#suppressionsupdatedby" title="SuppressionsUpdatedBy">SuppressionsUpdatedBy</a>: <i>String</i>
    <a href="#suppresscurrentfindingsondisabled" title="SuppressCurrentFindingsOnDisabled">SuppressCurrentFindingsOnDisabled</a>: <i>Boolean</i>
    <a href="#controlstatus" title="ControlStatus">ControlStatus</a>: <i>String</i>
    <a href="#disabledreason" title="DisabledReason">DisabledReason</a>: <i>String</i>
</pre>

## Properties

#### StandardCode

_Required_: Yes

_Type_: String

_Allowed Values_: <code>CIS1.4</code> | <code>CIS1.2</code> | <code>CIS</code> | <code>PCIDSS</code> | <code>AFSBP</code>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

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

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

AWS CloudFormation generates a unique identifier for the delay resource.

