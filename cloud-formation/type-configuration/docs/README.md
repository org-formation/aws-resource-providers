# Community::CloudFormation::TypeConfiguration

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Community::CloudFormation::TypeConfiguration",
    "Properties" : {
        "<a href="#resourceid" title="ResourceId">ResourceId</a>" : <i>String</i>,
        "<a href="#type" title="Type">Type</a>" : <i>String</i>,
        "<a href="#configurationalias" title="ConfigurationAlias">ConfigurationAlias</a>" : <i>String</i>,
        "<a href="#configuration" title="Configuration">Configuration</a>" : <i>String</i>,
        "<a href="#typename" title="TypeName">TypeName</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Community::CloudFormation::TypeConfiguration
Properties:
    <a href="#resourceid" title="ResourceId">ResourceId</a>: <i>String</i>
    <a href="#type" title="Type">Type</a>: <i>String</i>
    <a href="#configurationalias" title="ConfigurationAlias">ConfigurationAlias</a>: <i>String</i>
    <a href="#configuration" title="Configuration">Configuration</a>: <i>String</i>
    <a href="#typename" title="TypeName">TypeName</a>: <i>String</i>
</pre>

## Properties

#### ResourceId

_Required_: No

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### Type

_Required_: Yes

_Type_: String

_Allowed Values_: <code>RESOURCE</code> | <code>MODULE</code> | <code>HOOK</code>

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

#### ConfigurationAlias

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Configuration

_Required_: No

_Type_: String

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### TypeName

_Required_: Yes

_Type_: String

_Update requires_: [Replacement](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-replacement)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the ResourceId.
