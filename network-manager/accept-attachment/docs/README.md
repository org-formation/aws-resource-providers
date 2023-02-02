# Community::NetworkManager::AcceptAttachment

Accepts a core network attachment request. Once the attachment request is accepted by a core network owner, the attachment is created and connected to a core network. The creation of the resource only accepts the attachment & waits until it becomes available. Other operations do not have any effect.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::NetworkManager::AcceptAttachment",
    "Properties" : {
        "<a href="#attachmentid" title="AttachmentId">AttachmentId</a>" : <i>String</i>,
    }
}
</pre>

### YAML

<pre>
Type: Community::NetworkManager::AcceptAttachment
Properties:
    <a href="#attachmentid" title="AttachmentId">AttachmentId</a>: <i>String</i>
</pre>

## Properties

#### AttachmentId

The ID of the attachment.

_Required_: Yes

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Id.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### AttachmentType

The type of the attachment, either 'connect' or 'vpc'.

#### AttachmentState

The current state of the attachment.

#### Id

The ID of the acceptance of attachment

