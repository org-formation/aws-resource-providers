# AWS Resource Providers

A community driven repository where you can find AWS Resource Type Providers for different purposes (including org-formation ones)

## Resources

| Resource | Description | Status  | Docs
|---|---|---|---|
| Community::IAM::PasswordPolicy | Resource that allows for the creation of an IAM Password Policy (applies to entire account) | in progress | [installation](iam/password-policy/installation.md) <br/> [docs](iam/password-policy/docs/README.md) <br/> [example](iam/password-policy/example.yml) |
| Community::IAM::SamlProvider | Resource that allows for the creation of an SAML based Identity Provider | in progress |  [installation](iam/saml-provider/installation.md) <br/> [docs](iam/saml-provider/docs/README.md) <br/> [example](iam/saml-provider/example.yml) |
| Community::ServiceQuotas::CloudFormation | Custom Service Quota limits for CloudFormation resources. e.g: to increase the maximum number of stacks per account | in progress |  [installation](service-quotas/cloud-formation/installation.md) <br/> [docs](service-quotas/cloud-formation/docs/README.md)  <br/> [example](service-quotas/cloud-formation/example.yml) |
| Community::ServiceQuotas::S3 | Custom Service Quota limits for S3 resources. e.g: to increase the maximum number of buckets per account | in progress | [installation](service-quotas/s3/installation.md) <br/> [docs](service-quotas/s3/docs/README.md) <br/> [example](service-quotas/s3/example.yml)  |
| Community::EC2::EbsEncryptionDefaults    | Region level EBS encryption defaults: encryption enabled/disabled and KmsKeyId | in progress | [installation](ec2/ebs-encryption-defaults/installation.md) <br/> [docs](ec2/ebs-encryption-defaults/docs/README.md) <br/> [example](ec2/ebs-encryption-defaults/example.yml) |
| Community::S3::PublicAccessBlock | Account level public access block (applies to all buckets within account) | in progress |  [installation](s3/public-access-block/installation.md) <br/> [docs](s3/public-access-block/docs/README.md) <br/> [example](s3/public-access-block/example.yml)  |
| Community::CloudFormation::Delay | Resource that waits for a specified time period. | in progress | [installation](cloud-formation/delay/installation.md) <br/> [docs](cloud-formation/delay/docs/README.md) <br/> [example](cloud-formation/delay/example.yml) |