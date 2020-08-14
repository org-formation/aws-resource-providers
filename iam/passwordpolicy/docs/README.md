# OC::Organizations::PasswordPolicy

Resource schema for OC::Organizations::PasswordPolicy.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "OC::Organizations::PasswordPolicy",
    "Properties" : {
        "<a href="#minimumpasswordlength" title="MinimumPasswordLength">MinimumPasswordLength</a>" : <i>Double</i>,
        "<a href="#requiresymbols" title="RequireSymbols">RequireSymbols</a>" : <i>Boolean</i>,
        "<a href="#requirenumbers" title="RequireNumbers">RequireNumbers</a>" : <i>Boolean</i>,
        "<a href="#requireuppercasecharacters" title="RequireUppercaseCharacters">RequireUppercaseCharacters</a>" : <i>Boolean</i>,
        "<a href="#requirelowercasecharacters" title="RequireLowercaseCharacters">RequireLowercaseCharacters</a>" : <i>Boolean</i>,
        "<a href="#allowuserstochangepassword" title="AllowUsersToChangePassword">AllowUsersToChangePassword</a>" : <i>Boolean</i>,
        "<a href="#maxpasswordage" title="MaxPasswordAge">MaxPasswordAge</a>" : <i>Double</i>,
        "<a href="#passwordreuseprevention" title="PasswordReusePrevention">PasswordReusePrevention</a>" : <i>Double</i>,
        "<a href="#hardexpiry" title="HardExpiry">HardExpiry</a>" : <i>Boolean</i>
    }
}
</pre>

### YAML

<pre>
Type: OC::Organizations::PasswordPolicy
Properties:
    <a href="#minimumpasswordlength" title="MinimumPasswordLength">MinimumPasswordLength</a>: <i>Double</i>
    <a href="#requiresymbols" title="RequireSymbols">RequireSymbols</a>: <i>Boolean</i>
    <a href="#requirenumbers" title="RequireNumbers">RequireNumbers</a>: <i>Boolean</i>
    <a href="#requireuppercasecharacters" title="RequireUppercaseCharacters">RequireUppercaseCharacters</a>: <i>Boolean</i>
    <a href="#requirelowercasecharacters" title="RequireLowercaseCharacters">RequireLowercaseCharacters</a>: <i>Boolean</i>
    <a href="#allowuserstochangepassword" title="AllowUsersToChangePassword">AllowUsersToChangePassword</a>: <i>Boolean</i>
    <a href="#maxpasswordage" title="MaxPasswordAge">MaxPasswordAge</a>: <i>Double</i>
    <a href="#passwordreuseprevention" title="PasswordReusePrevention">PasswordReusePrevention</a>: <i>Double</i>
    <a href="#hardexpiry" title="HardExpiry">HardExpiry</a>: <i>Boolean</i>
</pre>

## Properties

#### MinimumPasswordLength

The minimum number of characters allowed in an IAM user password. If you do not specify a value for this parameter, then the operation uses the default value of 6.

_Required_: No

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RequireSymbols

Specifies whether IAM user passwords must contain at least one of the following non-alphanumeric characters: ! @ # $ % ^ &amp; * ( ) _ + - = [ ] { } | ' If you do not specify a value for this parameter, then the operation uses the default value of false. The result is that passwords do not require at least one symbol character.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RequireNumbers

Specifies whether IAM user passwords must contain at least one numeric character (0 to 9). If you do not specify a value for this parameter, then the operation uses the default value of false. The result is that passwords do not require at least one numeric character.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RequireUppercaseCharacters

Specifies whether IAM user passwords must contain at least one uppercase character from the ISO basic Latin alphabet (A to Z). If you do not specify a value for this parameter, then the operation uses the default value of false. The result is that passwords do not require at least one uppercase character.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### RequireLowercaseCharacters

Specifies whether IAM user passwords must contain at least one lowercase character from the ISO basic Latin alphabet (a to z). If you do not specify a value for this parameter, then the operation uses the default value of false. The result is that passwords do not require at least one lowercase character.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### AllowUsersToChangePassword

Allows all IAM users in your account to use the AWS Management Console to change their own passwords. For more information, see Letting IAM Users Change Their Own Passwords in the IAM User Guide. If you do not specify a value for this parameter, then the operation uses the default value of false. The result is that IAM users in the account do not automatically have permissions to change their own password.

_Required_: No

_Type_: Boolean

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### MaxPasswordAge

The number of days that an IAM user password is valid. If you do not specify a value for this parameter, then the IAM user passwords never expire.

_Required_: No

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### PasswordReusePrevention

Specifies the number of previous passwords that IAM users are prevented from reusing. If you do not specify a value for this parameter, then the IAM users are not prevented from reusing previous passwords.

_Required_: No

_Type_: Double

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### HardExpiry

Prevents IAM users from setting a new password after their password has expired. The IAM user cannot be accessed until an administrator resets the password. If you do not specify a value for this parameter, then the operation uses the default value of false. The result is that IAM users can change their passwords after they expire and continue to sign in as the user.

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

AWS CloudFormation generates a unique identifier for the password policy resource.

#### ExpirePasswords

Indicates whether passwords in the account expire. Returns true if MaxPasswordAge contains a value greater than 0. Returns false if MaxPasswordAge is 0 or not present.

