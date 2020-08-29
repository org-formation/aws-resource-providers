# Community::Organizations::EbsEncryptionDefaults

## Installation using AWS CLI
``` bash
aws cloudformation register-type \
  --type-name Community::Organizations::EbsEncryptionDefaults \
  --type RESOURCE \
  --schema-handler-package s3://community-resource-provider-catalog/community-ec2-ebsencryptiondefaults-0.1.0.zip

aws cloudformation describe-type-registration --registration-token <registration-token> 

aws cloudformation set-type-default-version \
  --version-id <version-id> \
  --type-name Community::Organizations::EbsEncryptionDefaults \
  --type RESOURCE
```