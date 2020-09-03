# Community::S3::PublicAccessBlock

Account level public access block (applies to all buckets within account).

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::S3::PublicAccessBlock",
    "Properties" : {
        "<a href="#blockpublicacls" title="BlockPublicAcls">BlockPublicAcls</a>" : <i>Boolean</i>,
        "<a href="#blockpublicpolicy" title="BlockPublicPolicy">BlockPublicPolicy</a>" : <i>Boolean</i>,
        "<a href="#ignorepublicacls" title="IgnorePublicAcls">IgnorePublicAcls</a>" : <i>Boolean</i>,
        "<a href="#restrictpublicbuckets" title="RestrictPublicBuckets">RestrictPublicBuckets</a>" : <i>Boolean</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::S3::PublicAccessBlock
Properties:
    <a href="#blockpublicacls" title="BlockPublicAcls">BlockPublicAcls</a>: <i>Boolean</i>
    <a href="#blockpublicpolicy" title="BlockPublicPolicy">BlockPublicPolicy</a>: <i>Boolean</i>
    <a href="#ignorepublicacls" title="IgnorePublicAcls">IgnorePublicAcls</a>: <i>Boolean</i>
    <a href="#restrictpublicbuckets" title="RestrictPublicBuckets">RestrictPublicBuckets</a>: <i>Boolean</i>
</pre>

## Properties

#### BlockPublicAcls

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### BlockPublicPolicy

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### IgnorePublicAcls

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RestrictPublicBuckets

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### ResourceId

Returns the <code>ResourceId</code> value.

