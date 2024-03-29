# Community::Account::AlternateContact

## Installation using AWS CLI
``` bash
# first install the execution role
aws cloudformation create-stack \
  --template-url https://community-resource-provider-catalog.s3.amazonaws.com/community-account-alternatecontact-resource-role-0.1.0.yml \
  --stack-name community-organizations-alternatecontact-resource-role \
  --capabilities CAPABILITY_IAM

aws cloudformation wait stack-create-complete \
  --stack-name community-organizations-alternatecontact-resource-role

# get the value of the ExecutionRoleArn Output
aws cloudformation describe-stacks \
  --stack-name community-organizations-alternatecontact-resource-role

# register the cloudformation type
aws cloudformation register-type \
  --type-name Community::Account::AlternateContact \
  --type RESOURCE \
  --schema-handler-package s3://community-resource-provider-catalog/community-account-alternatecontact-0.1.0.zip \
  --execution-role <role-arn-from-output>

aws cloudformation describe-type-registration --registration-token <registration-token>

aws cloudformation set-type-default-version \
  --version-id <version-id> \
  --type-name Community::Account::AlternateContact \
  --type RESOURCE
```

## Installation using org-formation task
For more information on AWS Organization Formation, see: https://github.com/org-formation/org-formation-cli

``` yaml
CommunityAlternateContactsRP:
  Type: register-type
  SchemaHandlerPackage: s3://community-resource-provider-catalog/community-account-alternatecontact-0.1.0.zip
  ResourceType: 'Community::Account::AlternateContact'
  MaxConcurrentTasks: 10
  OrganizationBinding:
    IncludeMasterAccount: true
    Account: '*'
    Region: us-east-1
```
