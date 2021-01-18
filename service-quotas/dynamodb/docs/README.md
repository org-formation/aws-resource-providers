# Community::ServiceQuotas::DynamoDB

Custom Service Quota limits for DynamoDB resources. e.g: to increase the maximum number of tables per region.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::ServiceQuotas::DynamoDB",
    "Properties" : {
        "<a href="#tables" title="Tables">Tables</a>" : <i>Integer</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::ServiceQuotas::DynamoDB
Properties:
    <a href="#tables" title="Tables">Tables</a>: <i>Integer</i>
</pre>

## Properties

#### Tables

The maximum number of tables that can be created per region. (default = 256).

_Required_: No

_Type_: Integer

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Arn.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Arn

Returns the <code>Arn</code> value.

