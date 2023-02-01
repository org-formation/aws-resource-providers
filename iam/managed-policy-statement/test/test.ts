import { IAM, STS } from "aws-sdk";
import { getPolicyDocument, updatePolicyWithStatement } from "../src/handlers";
import { ResourceModel } from "../src/models";

const iam = new IAM();
const sts = new STS();

const test = async (awsAccountId) => {
  const promises: Promise<void>[] = [];
  for (let i = 0; i < 10; i++) {
    promises.push(updatePolicyWithStatement(iam, awsAccountId, new ResourceModel({
      managedPolicyName: "mergetest",
      managedPolicyPath: "/path",
      statementId: "test" + i,
      statementJson: JSON.stringify({
        Effect: "Allow",
        Action: "xx:yy" + i,
        Resource: "*"
      })
    })));
  }

  await Promise.all(promises);
  console.log(await getPolicyDocument(iam, awsAccountId, "mergetest", "/path"));

  for (let i = 0; i < 10; i++) {
    promises.push(updatePolicyWithStatement(iam, "102625093955", new ResourceModel({
      managedPolicyName: "mergetest",
      managedPolicyPath: "/path",
      statementId: "test" + i,
      statementJson: undefined,
    }
    )));
  }
  await Promise.all(promises);

  console.log(await getPolicyDocument(iam, awsAccountId, "mergetest", "/path"));


};
sts.getCallerIdentity().promise().then(x=>test(x.Account));