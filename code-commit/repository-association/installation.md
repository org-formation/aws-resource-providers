# Community::CodeCommit::RepositoryAssociation

## Installation using AWS CLI
``` bash
# first install the execution role
aws cloudformation create-stack \
  --template-url https://community-resource-provider-catalog.s3.amazonaws.com/community-codecommit-repositoryassociation-resource-role-0.1.0.yml \
  --stack-name community-codecommit-repositoryassociation-resource-role \
  --capabilities CAPABILITY_IAM

  aws cloudformation wait stack-create-complete \
    --stack-name community-codecommit-repositoryassociation-resource-role

# get the value of the ExecutionRoleArn Output
aws cloudformation describe-stacks \
  --stack-name community-codecommit-repositoryassociation-resource-role

# register the cloudformation type
aws cloudformation register-type \
  --type-name Community::CodeCommit::RepositoryAssociation \
  --type RESOURCE \
  --schema-handler-package s3://community-resource-provider-catalog/community-codecommit-repositoryassociation-0.1.0.zip \
  --execution-role <role-arn-from-output>

aws cloudformation describe-type-registration --registration-token <registration-token> 

aws cloudformation set-type-default-version \
  --version-id <version-id> \
  --type-name Community::CodeCommit::RepositoryAssociation \
  --type RESOURCE
  
```
``` yaml
CommunityCodeCommitRepositoryAssociationRP:
  Type: register-type
  SchemaHandlerPackage: s3://community-resource-provider-catalog/community-codecommit-repositoryassociation-0.1.0.zip
  ResourceType: 'Community::CodeCommit::RepositoryAssociation'
  MaxConcurrentTasks: 10
  OrganizationBinding:
    IncludeMasterAccount: true
    Account: '*'
    Region: us-east-1
```;
