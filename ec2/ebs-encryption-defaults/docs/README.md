# Community::EC2::EbsEncryptionDefaults

Region level EBS encryption defaults: encryption enabled/disabled and KmsKeyId.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::EC2::EbsEncryptionDefaults",
    "Properties" : {
        "<a href="#enableebsencryptionbydefault" title="EnableEbsEncryptionByDefault">EnableEbsEncryptionByDefault</a>" : <i>Boolean</i>,
        "<a href="#defaultebsencryptionkeyid" title="DefaultEbsEncryptionKeyId">DefaultEbsEncryptionKeyId</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::EC2::EbsEncryptionDefaults
Properties:
    <a href="#enableebsencryptionbydefault" title="EnableEbsEncryptionByDefault">EnableEbsEncryptionByDefault</a>: <i>Boolean</i>
    <a href="#defaultebsencryptionkeyid" title="DefaultEbsEncryptionKeyId">DefaultEbsEncryptionKeyId</a>: <i>String</i>
</pre>

## Properties

#### EnableEbsEncryptionByDefault

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### DefaultEbsEncryptionKeyId

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

Returns the <code>ResourceId</code> value.

