# Community::ServiceQuotas::S3

## Installation using AWS CLI
``` bash
aws cloudformation register-type \
  --type-name Community::ServiceQuotas::S3 \
  --type RESOURCE \
  --schema-handler-package s3://community-resource-provider-catalog/community-servicequotas-s3-0.1.0.zip

aws cloudformation set-type-default-version
```