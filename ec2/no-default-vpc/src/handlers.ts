import { EC2 } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Logger } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { v4 as uuidv4 } from 'uuid';
import { ResourceModel } from './models';
import { FilterList } from 'aws-sdk/clients/ec2';

const deleteInternetGateways = async (service: EC2, logger: Logger, vpcId: string) => {
    try {
        const filters: FilterList = [
            {
                Name: 'attachment.vpc-id',
                Values: [vpcId],
            },
        ];
        logger.log({ method: 'before deleteInternetGateways', vpcId });
        const internetGateways = await service.describeInternetGateways({ Filters: filters }).promise();
        for (const ig of internetGateways.InternetGateways) {
            logger.log({ method: 'before detachInternetGateway', vpcId, ig });
            await service.detachInternetGateway({ InternetGatewayId: ig.InternetGatewayId, VpcId: vpcId }).promise();

            logger.log({ method: 'before deleteInternetGateway', vpcId, ig });
            await service.deleteInternetGateway({ InternetGatewayId: ig.InternetGatewayId }).promise();
        }

        logger.log({ method: 'after deleteInternetGateways', vpcId });
    } catch (err) {
        logger.log({ method: 'catch deleteInternetGateways', vpcId, err });
        throw err;
    }
};

const deleteRouteTables = async (service: EC2, logger: Logger, filters: FilterList) => {
    try {
        logger.log({ method: 'before deleteRouteTables', filters });
        const routeTables = await service.describeRouteTables({ Filters: filters }).promise();
        for (const rt of routeTables.RouteTables) {
            const main = rt.Associations.findIndex((x) => x.Main);
            if (main != -1) continue;

            logger.log({ method: 'before deleteRouteTable', rt });
            await service.deleteRouteTable({ RouteTableId: rt.RouteTableId }).promise();
        }

        logger.log({ method: 'after deleteRouteTables', filters });
    } catch (err) {
        logger.log({ method: 'catch deleteRouteTables', filters, err });
        throw err;
    }
};

const deleteNetworkAcls = async (service: EC2, logger: Logger, filters: FilterList) => {
    try {
        logger.log({ method: 'before deleteNetworkAcls', filters });
        const networkAcls = await service.describeNetworkAcls({ Filters: filters }).promise();
        for (const na of networkAcls.NetworkAcls) {
            if (na.IsDefault) continue;

            logger.log({ method: 'before deleteNetworkAcl', na });
            await service.deleteNetworkAcl({ NetworkAclId: na.NetworkAclId }).promise();
        }
        logger.log({ method: 'after deleteNetworkAcls', filters });
    } catch (err) {
        logger.log({ method: 'catch deleteNetworkAcls', filters, err });
        throw err;
    }
};

const deleteSubnets = async (service: EC2, logger: Logger, filters: FilterList) => {
    try {
        logger.log({ method: 'before deleteSubnets', filters });
        const subnets = await service.describeSubnets({ Filters: filters }).promise();
        for (const sn of subnets.Subnets) {
            logger.log({ method: 'before deleteSubnet', sn });
            await service.deleteSubnet({ SubnetId: sn.SubnetId }).promise();
        }
        logger.log({ method: 'after deleteSubnets', filters });
    } catch (err) {
        logger.log({ method: 'catch deleteSubnets', filters, err });
        throw err;
    }
};

const deleteSecurityGroups = async (service: EC2, logger: Logger, filters: FilterList) => {
    try {
        logger.log({ method: 'before deleteSecurityGroups', filters });
        const securityGroups = await service.describeSecurityGroups({ Filters: filters }).promise();
        for (const sg of securityGroups.SecurityGroups) {
            if (sg.GroupName === 'default') continue;

            logger.log({ method: 'before deleteSecurityGroup', sg });
            await service.deleteSecurityGroup({ GroupId: sg.GroupId }).promise();
        }
        logger.log({ method: 'after deleteSecurityGroups', filters });
    } catch (err) {
        logger.log({ method: 'catch deleteSecurityGroups', filters, err });
        throw err;
    }
};

const deleteVpc = async (service: EC2, logger: Logger, vpcId: string) => {
    try {
        logger.log({ method: 'before deleteVpc', vpcId });
        const filters: FilterList = [
            {
                Name: 'vpc-id',
                Values: [vpcId],
            },
        ];

        logger.log({ method: 'before describeNetworkInterfaces', filters });
        const response = await service.describeNetworkInterfaces({ Filters: filters }).promise();
        if (response.NetworkInterfaces.length > 0) {
            logger.log({ method: 'before throw in use exception', networkInterfaces: response.NetworkInterfaces });
            const list = response.NetworkInterfaces.join(', ');
            throw new exceptions.InvalidRequest(`Unable to delete default VPC, there is network interfaces attached (${list})`);
        }

        await deleteInternetGateways(service, logger, vpcId);
        await deleteSubnets(service, logger, filters);
        await deleteRouteTables(service, logger, filters);
        await deleteNetworkAcls(service, logger, filters);
        await deleteSecurityGroups(service, logger, filters);

        logger.log({ method: 'before actual deleteVpc', vpcId });
        await service.deleteVpc({ VpcId: vpcId }).promise();

        logger.log({ method: 'after deleteVpc', vpcId });
    } catch (err) {
        logger.log({ method: 'catch deleteVpc', vpcId, err });
        throw err;
    }
};

class Resource extends BaseResource<ResourceModel> {
    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     */
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        const { desiredResourceState, logicalResourceIdentifier, awsAccountId, region } = args.request;

        args.logger.log({ method: 'before create handler', desiredResourceState, logicalResourceIdentifier, awsAccountId, region });

        if (model.resourceId) {
            throw new exceptions.InvalidRequest('Resource identifier cannot be provided during creation.');
        }

        model.resourceId = `arn:community:${region}:${awsAccountId}:ec2:no-default-vpc/${uuidv4()}`;

        const accountAttributes = await service.describeAccountAttributes({ AttributeNames: ['default-vpc'] }).promise();
        args.logger.log({ method: 'create handler', accountAttributes });

        const defaultVpcAttribute = accountAttributes.AccountAttributes.find((x) => x.AttributeName === 'default-vpc');
        if (defaultVpcAttribute) {
            for (const valueContainer of defaultVpcAttribute.AttributeValues) {
                const vpcId = valueContainer.AttributeValue;
                if (vpcId === 'none') {
                    // This will be set to none whenever another resource exists
                    // or when there is no default VPC.
                    throw new exceptions.AlreadyExists(this.typeName, awsAccountId);
                }

                args.logger.log({ method: 'before deleteVpc', vpcId });
                await deleteVpc(service, args.logger, vpcId);
            }
        }

        args.logger.log({ method: 'done create handler', model });
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<null> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;

        try {
            args.logger.log({ method: 'before delete handler', desiredResourceState, logicalResourceIdentifier });

            await service.createDefaultVpc({}).promise();

            args.logger.log({ method: 'after delete handler' });
            return Promise.resolve(null);
        } catch (err) {
            if (err && err.code === 'DefaultVpcAlreadyExists') {
                throw new exceptions.NotFound(this.typeName, model.resourceId || logicalResourceIdentifier);
            } else {
                throw err;
            }
        }
    }

    @handlerEvent(Action.Read)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async read(action: Action, args: HandlerArgs<ResourceModel>, service: EC2, model: ResourceModel): Promise<ResourceModel> {
        return Promise.resolve(model);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;
