# Community::CloudFormation::Delay

## Installation using AWS CLI
``` bash
aws cloudformation register-type \
  --type-name Community::CloudFormation::Delay \
  --type RESOURCE \
  --schema-handler-package s3://community-resource-provider-catalog/community-cloudformation-delay-0.1.0.zip

aws cloudformation describe-type-registration --registration-token <registration-token> 

aws cloudformation set-type-default-version \
  --version-id <version-id> \
  --type-name Community::CloudFormation::Delay \
  --type RESOURCE
```

## Installation using org-formation task
For more information on AWS Organization Formation, see: https://github.com/org-formation/org-formation-cli

``` yaml
CommunityCloudFormationDelayRP:
  Type: register-type
  SchemaHandlerPackage: s3://community-resource-provider-catalog/community-cloudformation-delay-0.1.0.zip
  ResourceType: 'Community::CloudFormation::Delay'
  MaxConcurrentTasks: 10
  OrganizationBinding:
    IncludeMasterAccount: true
    Account: '*'
    Region: us-east-1
```