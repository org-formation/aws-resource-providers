# Community::ServiceQuotas::IAM

Custom Service Quota limits for IAM resources. e.g: to increase the maximum number of IAM Roles per account.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::ServiceQuotas::IAM",
    "Properties" : {
        "<a href="#roles" title="Roles">Roles</a>" : <i>Integer</i>,
        "<a href="#customermanagedpolicies" title="CustomerManagedPolicies">CustomerManagedPolicies</a>" : <i>Integer</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::ServiceQuotas::IAM
Properties:
    <a href="#roles" title="Roles">Roles</a>: <i>Integer</i>
    <a href="#customermanagedpolicies" title="CustomerManagedPolicies">CustomerManagedPolicies</a>: <i>Integer</i>
</pre>

## Properties

#### Roles

Maximum number of AWS IAM Roles that you can create (default = 1000).

_Required_: No

_Type_: Integer

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### CustomerManagedPolicies

Maximum number of AWS IAM Customer Managed Policies that you can create (default = 1500).

_Required_: No

_Type_: Integer

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

Returns the <code>ResourceId</code> value.

