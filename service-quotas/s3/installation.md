# Community::ServiceQuotas::S3

## Installation using AWS CLI
``` bash

# first install the execution role
aws cloudformation create-stack \
  --template-url https://community-resource-provider-catalog.s3.amazonaws.com/community-servicequotas-s3-resource-role-0.1.0.yml \
  --stack-name community-servicequotas-s3-resource-role \
  --capabilities CAPABILITY_IAM

aws cloudformation wait stack-create-complete \
  --stack-name community-servicequotas-s3-resource-role

# get the value of the ExecutionRoleArn Output
aws cloudformation describe-stacks \
  --stack-name community-servicequotas-s3-resource-role

# register the cloudformation type
aws cloudformation register-type \
  --type-name Community::ServiceQuotas::S3 \
  --type RESOURCE \
  --schema-handler-package s3://community-resource-provider-catalog/community-servicequotas-s3-0.1.0.zip \
  --execution-role <execution-role-arn>

aws cloudformation describe-type-registration --registration-token <registration-token> 

aws cloudformation set-type-default-version \
  --version-id <version-id> \
  --type-name Community::ServiceQuotas::S3 \
  --type RESOURCE
  
```


## Installation using org-formation task
For more information on AWS Organization Formation, see: https://github.com/org-formation/org-formation-cli

``` yaml
CommunityServicequotasS3RP:
  Type: register-type
  SchemaHandlerPackage: s3://community-resource-provider-catalog/community-servicequotas-s3-0.1.0.zip
  ResourceType: 'Community::ServiceQuotas::S3'
  MaxConcurrentTasks: 10
  OrganizationBinding:
    IncludeMasterAccount: true
    Account: '*'
    Region: us-east-1
```