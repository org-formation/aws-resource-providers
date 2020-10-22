# Community::CodeCommit::ApprovalRuleTemplate

This CloudFormation Resource Provider allows to [create approval rule template](https://docs.aws.amazon.com/codecommit/latest/userguide/approval-rule-templates.html) for CodeCommit.

## Resource and Property Reference

Check the [Resource and Property Types Reference documentation](./docs/README.md) that was generated from the JSON schema describing the resource called [Resource Provider Schema](./community-codecommit-approvalruletemplate.json).

## Installation

From packaged catalog in S3 bucket, you can follow instructions [here](./installation.md).

From source code:

1. Run `npm install --optional`
2. Customize the resource handlers to your needs in [handlers.ts](./src/handlers.ts)
3. Build the project with `npm run build`
4. You can test it locally with SAM CLI
5. Follow the steps on the AWS documentation to submit to the CloudFormation registry: https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/resource-types.html
6. Use [this template](./example.yml) to deploy an example
