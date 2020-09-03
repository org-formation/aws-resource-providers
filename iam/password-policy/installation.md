# Community::IAM::PasswordPolicy

## Installation using AWS CLI
``` bash
aws cloudformation register-type \
  --type-name Community::IAM::PasswordPolicy \
  --type RESOURCE \
  --schema-handler-package s3://community-resource-provider-catalog/community-iam-passwordpolicy-0.2.0.zip

aws cloudformation describe-type-registration --registration-token <registration-token> 

aws cloudformation set-type-default-version \
  --version-id <version-id> \
  --type-name Community::IAM::PasswordPolicy \
  --type RESOURCE

```