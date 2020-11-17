# AWS Resource Providers

[![License MIT](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/org-formation/aws-resource-providers/issues)

A community driven repository where you can find AWS Resource Type Providers for different purposes (including org-formation ones)

## Resources

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/org-formation/aws-resource-providers/cicd/master)](https://github.com/org-formation/aws-resource-providers/actions?query=branch%3Amaster+workflow%3Acicd) [![Codecov](https://img.shields.io/codecov/c/gh/org-formation/aws-resource-providers)](https://codecov.io/gh/org-formation/aws-resource-providers) [![Node.js version](https://img.shields.io/badge/dynamic/json?color=brightgreen&url=https://raw.githubusercontent.com/org-formation/aws-resource-providers/master/package.json&query=$.engines.node&label=nodejs)](https://nodejs.org/)

| Resource | Description | Status  | Docs
|---|---|---|---|
| Community::IAM::PasswordPolicy | Resource that allows for the creation of an IAM Password Policy (applies to entire account) | in progress | [installation](iam/password-policy/installation.md) <br/> [docs](iam/password-policy/docs/README.md) <br/> [example](iam/password-policy/example.yml) |
| Community::IAM::SamlProvider | Resource that allows for the creation of an SAML based Identity Provider | in progress |  [installation](iam/saml-provider/installation.md) <br/> [docs](iam/saml-provider/docs/README.md) <br/> [example](iam/saml-provider/example.yml) |
| Community::ServiceQuotas::CloudFormation | Custom Service Quota limits for CloudFormation resources. e.g: to increase the maximum number of stacks per account | in progress | [installation](service-quotas/cloud-formation/installation.md) <br/> [docs](service-quotas/cloud-formation/docs/README.md) <br/> [example](service-quotas/cloud-formation/example.yml) |
| Community::ServiceQuotas::S3 | Custom Service Quota limits for S3 resources. e.g: to increase the maximum number of buckets per account | in progress | [installation](service-quotas/s3/installation.md) <br/> [docs](service-quotas/s3/docs/README.md) <br/> [example](service-quotas/s3/example.yml)  |
| Community::Organizations::EbsEncryptionDefaults    | Region level EBS encryption defaults: encryption enabled/disabled and KmsKeyId | in progress | [installation](ec2/ebs-encryption-defaults/installation.md) <br/> [docs](ec2/ebs-encryption-defaults/docs/README.md) <br/> [example](ec2/ebs-encryption-defaults/example.yml) |
| Community::Organizations::NoDefaultVPC | When added to a template removes the Default VPC, when removed it re-adds it | [installation](ec2/no-default-vpc/installation.md) <br/> [docs](ec2/no-default-vpc/docs/README.md) <br/> [example](ec2/no-default-vpc/example.yml) |
| Community::Organizations::EnableAWSServiceAccess | Enable an AWS Service to have to your AWS Org | [installation]() <br/> [docs]() <br/> [example](organizations/enable-aws-service/example.yml) |
| Community::Organizations::DelegatedAdmin | Delegate Administration of an AWS Service to an account other then the Organization Management Account | [installation]() <br/> [docs]() <br/> [example](organizations/delegated-admin/example.yml) |
| Community::S3::PublicAccessBlock | Account level public access block (applies to all buckets within account) | in progress |  [installation](s3/public-access-block/installation.md) <br/> [docs](s3/public-access-block/docs/README.md) <br/> [example](s3/public-access-block/example.yml)  |
| Community::CloudFormation::Delay | Resource that waits for a specified time period. | in progress | [installation](cloud-formation/delay/installation.md) <br/> [docs](cloud-formation/delay/docs/README.md) <br/> [example](cloud-formation/delay/example.yml) |
| Community::CodeCommit::ApprovalRuleTemplate | Resource that allows for the creation of approval rule template for CodeCommit. | in progress | [installation](code-commit/approval-rule-template/installation.md) <br/> [docs](code-commit/approval-rule-template/docs/README.md) <br/> [example](code-commit/approval-rule-template/example.yml) |
| Community::CodeCommit::RepositoryAssociation | Resource that allows for the association of a particular approval rule template to CodeCommit repositories. | in progress | [installation](code-commit/repository-association/installation.md) <br/> [docs](code-commit/repository-association/docs/README.md) <br/> [example](code-commit/repository-association/example.yml) |

Development
-----------

Check out the master branch and run [Lerna](https://lerna.js.org/) to get started:

```
npm run bootstrap
```

Now that you have the dependencies installed for every package, you can run this command in the individual package folder to compile them. By doing so in the root, all packages will be compiled.

```
npm run build
```

Linting is done via [TSLint](http://palantir.github.io/tslint/) and running unit tests via [Jest](https://jestjs.io/). The continuous integration runs these checks, but you can run them locally with:

```
npm run lint
npm test
```
