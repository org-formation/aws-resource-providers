# AWS::CloudFormation::Delay

This CloudFormation Resource Provider is very similar to [AWS::CloudFormation::WaitCondition](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-waitcondition.html), except that we don't need to wait for an external process, only for a period of time (more context [here](https://github.com/aws-cloudformation/aws-cloudformation-coverage-roadmap/issues/589)).

## Resource and Property Reference

Check the [Resource and Property Types Reference documentation](./docs/README.md) that was generated from the JSON schema describing the resource called [Resource Provider Schema](./oc-cloudformation-delay.json).

## Usage

1. Run `npm install --optional`
2. Customize the resource handlers to your needs in [handlers.ts](./src/handlers.ts)
3. Build the project with `npm run build`
4. You can test it locally with SAM CLI
5. Follow the steps on the AWS documentation to submit to the CloudFormation registry: https://docs.aws.amazon.com/cloudformation-cli/latest/userguide/resource-types.html
6. Use [this template](./sample.yml) to deploy a sample delay resource

> Don't modify [models.ts](./src/models.ts) by hand, any modifications will be overwritten when the `generate` or `package` commands are run.

Keep in mind, during runtime all logs will be delivered to CloudWatch except those used with `debug` method.
