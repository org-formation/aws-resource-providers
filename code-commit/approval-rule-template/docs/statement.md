# Community::CodeCommit::ApprovalRuleTemplate Statement

The statement of the approval rule template content.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "<a href="#type" title="Type">Type</a>" : <i>String</i>,
    "<a href="#numberofapprovalsneeded" title="NumberOfApprovalsNeeded">NumberOfApprovalsNeeded</a>" : <i>Integer</i>,
    "<a href="#approvalpoolmembers" title="ApprovalPoolMembers">ApprovalPoolMembers</a>" : <i>[ String, ... ]</i>
}
</pre>

### YAML

<pre>
<a href="#type" title="Type">Type</a>: <i>String</i>
<a href="#numberofapprovalsneeded" title="NumberOfApprovalsNeeded">NumberOfApprovalsNeeded</a>: <i>Integer</i>
<a href="#approvalpoolmembers" title="ApprovalPoolMembers">ApprovalPoolMembers</a>: <i>
      - String</i>
</pre>

## Properties

#### Type

_Required_: No

_Type_: String

_Allowed Values_: <code>Approvers</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### NumberOfApprovalsNeeded

_Required_: No

_Type_: Integer

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ApprovalPoolMembers

If approval pool members are specified, only approvals from these members will count toward satisfying this rule. You can use wildcards to match multiple approvers with one value.

_Required_: No

_Type_: List of String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

