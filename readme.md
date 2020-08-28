# AWS Resource Providers

A community driven repository where you can find AWS Resource Type Providers for different purposes (including org-formation ones)

## Resources

| Resource | Description | Status  | usage | installation
|---|---|---|---|---|
| Community::IAM::PasswordPolicy | Resource that allows for the creation of an IAM Password Policy (applies to entire account) | in progress | [docs](iam/password-policy/docs/README.md) <br/> [example](iam/password-policy/example.yml) | [example](iam/password-policy/installation.md) |
| Community::IAM::SamlProvider | Resource that allows for the creation of an SAML based Identity Provider | in progress | [docs](iam/saml-provider/docs/README.md) <br/> [example](iam/saml-provider/example.yml) | [example](iam/saml-provider/installation.md) |
| Community::ServiceQuotas::CloudFormation | Custom Service Quota limits for CloudFormation resources. e.g: to increase the maximum number of stacks per account | in progress | [docs](service-quotas/cloud-formation/docs/README.md)  <br/> [example](service-quotas/cloud-formation/example.yml)   | [example](service-quotas/cloud-formation/installation.md) |
| Community::ServiceQuotas::S3 | Custom Service Quota limits for S3 resources. e.g: to increase the maximum number of buckets per account | in progress |[docs](service-quotas/s3/docs/README.md) <br/> [example](service-quotas/s3/example.yml)  | [example](service-quotas/s3/installation.md) |
| Community::EC2::EbsEncryptionDefaults    | Region level EBS encryption defaults: encryption enabled/disabled and KmsKeyId | in progress | [docs](ec2/ebs-encryption-defaults/docs/README.md) <br/> [example](ec2/ebs-encryption-defaults/example.yml) | [example](ec2/ebs-encryption-defaults/installation.md) |
| Community::S3::PublicAccessBlock | Account level public access block (applies to all buckets within account) | planned | todo | todo |
| Community::CloudFormation::Delay | Resource that waits for a specified time period. | in progress | [docs](cloud-formation/delay/docs/README.md) <br/> [example](cloud-formation/delay/example.yml)  | [example](cloud-formation/delay/installation.md) |