/* eslint-disable prettier/prettier */
import { SecurityHub } from "aws-sdk";
import { AwsSecurityFindingIdentifier, AwsSecurityFindingList } from "aws-sdk/clients/securityhub";

const doWork = async (controlArn: string) => {
  const sh = new SecurityHub({ region: "us-east-1" });

  let currentPageToken: string = undefined;
  do {
    const response = await sh
        .getFindings({
            NextToken: currentPageToken,
            MaxResults: 100,
            Filters: {
              WorkflowStatus: [{ Comparison: "EQUALS", Value: "NEW"}, { Comparison: "EQUALS", Value: "NOTIFIED"}],
              RecordState: [{ Comparison: 'EQUALS', Value: 'ACTIVE' }],
              ProductName: [{ Comparison: "EQUALS", Value: 'Security Hub' }],
              ProductFields: [{ Key: "StandardsControlArn", Value: controlArn, Comparison: "EQUALS" }],
            },
    }).promise();

    if (response.Findings.length) {
      const identifiers = response.Findings.map(x=>({ Id: x.Id, ProductArn: x.ProductArn }) as AwsSecurityFindingIdentifier)

      await sh.batchUpdateFindings({
          FindingIdentifiers: identifiers,
          Workflow: {
              Status: "SUPPRESSED",
          },
      }).promise();
    }
    
    currentPageToken = response.NextToken;
  } while (currentPageToken);
}


doWork(`arn:aws:securityhub:us-east-1:381769547263:control/aws-foundational-security-best-practices/v/1.0.0/CloudTrail.1`)