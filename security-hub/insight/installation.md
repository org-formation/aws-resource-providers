# Community::SecurityHub::Insight

## Installation using AWS CLI

pre-requisite: you need to deploy the cloudformation template [resource-role](./resource-role.yaml). this will create an IAM role, this IAM role can be used as the `execution-role-arn` argument below.

``` bash
aws cloudformation register-type \
  --type-name Community::SecurityHub::Insight \
  --type RESOURCE \
  --schema-handler-package s3://community-resource-provider-catalog/community-securityhub-insight-0.1.2.zip \
  --execution-role-arn <execution-role-arn>

aws cloudformation describe-type-registration --registration-token <registration-token> 

aws cloudformation set-type-default-version \
  --version-id <version-id> \
  --type-name Community::SecurityHub::Insight \
  --type RESOURCE
```

## Installation using org-formation task
For more information on AWS Organization Formation, see: https://github.com/org-formation/org-formation-cli

``` yaml
CommunityCloudFormationDelayRP:
  Type: register-type
  SchemaHandlerPackage: s3://community-resource-provider-catalog/community-securityhub-insight-0.1.2.zip
  ResourceType: 'Community::SecurityHub::Insight'
  MaxConcurrentTasks: 10
  OrganizationBinding:
    IncludeMasterAccount: true
    Account: '*'
    Region: us-east-1
```