import { EC2 } from 'aws-sdk';
import { commonAws, HandlerArgs } from 'aws-resource-providers-common';
import { Action, BaseResource, exceptions, handlerEvent, Optional, CfnResponse } from 'cfn-rpdk';
import { v4 as uuidv4 } from 'uuid';
import { ResourceModel } from './models';
import { FilterList } from 'aws-sdk/clients/ec2';


// Use this logger to forward log messages to CloudWatch Logs.
const LOGGER = console;

const deleteInternetGateways = async (service: EC2, vpcId: string) => {
    try {
        const filters: FilterList = [{
            Name: 'attachment.vpc-id',
            Values: [vpcId]
        }]
        LOGGER.info({ 'method': 'before deleteInternetGateways', vpcId });
        const internetGateways = await service.describeInternetGateways({ Filters: filters }).promise();
        for (const ig of internetGateways.InternetGateways) {

            LOGGER.info({ 'method': 'before detachInternetGateway', vpcId, ig });
            await service.detachInternetGateway({ InternetGatewayId: ig.InternetGatewayId, VpcId: vpcId }).promise();

            LOGGER.info({ 'method': 'before deleteInternetGateway', vpcId, ig });
            await service.deleteInternetGateway({ InternetGatewayId: ig.InternetGatewayId }).promise();
        }

        LOGGER.info({ 'method': 'after deleteInternetGateways', vpcId });
    } catch (err) {
        LOGGER.info({ 'method': 'catch deleteInternetGateways', vpcId, err });
        throw err;
    }
}

const deleteRouteTables = async (service: EC2, filters: FilterList) => {
    try {
        LOGGER.info({ 'method': 'before deleteRouteTables', filters });
        const routeTables = await service.describeRouteTables({ Filters: filters }).promise();
        for (const rt of routeTables.RouteTables) {
            const main = rt.Associations.findIndex(x => x.Main);
            if (main != -1) continue;

            LOGGER.info({ 'method': 'before deleteRouteTable', rt });
            await service.deleteRouteTable({ RouteTableId: rt.RouteTableId }).promise();
        }

        LOGGER.info({ 'method': 'after deleteRouteTables', filters });
    } catch (err) {
        LOGGER.info({ 'method': 'catch deleteRouteTables', filters, err });
        throw err;
    }
}

const deleteNetworkAcls = async (service: EC2, filters: FilterList) => {
    try {
        LOGGER.info({ 'method': 'before deleteNetworkAcls', filters });
        const networkAcls = await service.describeNetworkAcls({ Filters: filters }).promise();
        for (const na of networkAcls.NetworkAcls) {
            if (na.IsDefault) continue;

            LOGGER.info({ 'method': 'before deleteNetworkAcl', na });
            await service.deleteNetworkAcl({ NetworkAclId: na.NetworkAclId }).promise();
        }
        LOGGER.info({ 'method': 'after deleteNetworkAcls', filters });
    } catch (err) {
        LOGGER.info({ 'method': 'catch deleteNetworkAcls', filters, err });
        throw err;
    }
}

const deleteSubnets = async (service: EC2, filters: FilterList) => {
    try {
        LOGGER.info({ 'method': 'before deleteSubnets', filters });
        const subnets = await service.describeSubnets({ Filters: filters }).promise();
        for (const sn of subnets.Subnets) {

            LOGGER.info({ 'method': 'before deleteSubnet', sn });
            await service.deleteSubnet({ SubnetId: sn.SubnetId }).promise();
        }
        LOGGER.info({ 'method': 'after deleteSubnets', filters });
    } catch (err) {
        LOGGER.info({ 'method': 'catch deleteSubnets', filters, err });
        throw err;
    }
}

const deleteSecurityGroups = async (service: EC2, filters: FilterList) => {
    try {
        LOGGER.info({ 'method': 'before deleteSecurityGroups', filters });
        const securityGroups = await service.describeSecurityGroups({ Filters: filters }).promise();
        for (const sg of securityGroups.SecurityGroups) {
            if (sg.GroupName === 'default') continue;

            LOGGER.info({ 'method': 'before deleteSecurityGroup', sg });
            await service.deleteSecurityGroup({ GroupId: sg.GroupId }).promise();
        }
        LOGGER.info({ 'method': 'after deleteSecurityGroups', filters });
    } catch (err) {
        LOGGER.info({ 'method': 'catch deleteSecurityGroups', filters, err });
        throw err;
    }
}

const deleteVpc = async (service: EC2, vpcId: string) => {
    try {
        LOGGER.info({ 'method': 'before deleteVpc', vpcId });
        const filters: FilterList = [{
            Name: 'vpc-id',
            Values: [vpcId]
        }]

        LOGGER.info({ 'method': 'before describeNetworkInterfaces', filters });
        const response = await service.describeNetworkInterfaces({ Filters: filters }).promise();
        if (response.NetworkInterfaces.length > 0) {
            LOGGER.info({ 'method': 'before throw in use exception', networkInterfaces: response.NetworkInterfaces });
            const list = response.NetworkInterfaces.join(', ');
            throw new exceptions.InvalidRequest(`Unable to delete default VPC, there is network interfaces attached (${list})`);
        }

        await deleteInternetGateways(service, vpcId);
        await deleteSubnets(service, filters);
        await deleteRouteTables(service, filters);
        await deleteNetworkAcls(service, filters);
        await deleteSecurityGroups(service, filters);

        LOGGER.info({ 'method': 'before actual deleteVpc', vpcId });
        await service.deleteVpc({ VpcId: vpcId }).promise();

        LOGGER.info({ 'method': 'after deleteVpc', vpcId });
    } catch (err) {
        LOGGER.info({ 'method': 'catch deleteVpc', vpcId, err });
        throw err;
    }
}


class Resource extends BaseResource<ResourceModel> {

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     */
    @handlerEvent(Action.Create)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async create(action: Action, args: HandlerArgs<ResourceModel>, service: EC2): Promise<ResourceModel> {
        const { desiredResourceState, logicalResourceIdentifier, awsAccountId, region } = args.request;
        const model: ResourceModel = desiredResourceState;

        LOGGER.info({ 'method': 'before create handler', desiredResourceState, logicalResourceIdentifier, awsAccountId, region });

        if (model.resourceId) {
            throw new exceptions.InvalidRequest('Resource identifier cannot be provided during creation.');
        }

        model.resourceId = `arn:community:${region}:${awsAccountId}:ec2:no-default-vpc/${uuidv4()}`;

        const accountAttributes = await service.describeAccountAttributes({ AttributeNames: ['default-vpc'] }).promise();
        LOGGER.info({ 'method': 'create handler', accountAttributes });

        const defaultVpcAttribute = accountAttributes.AccountAttributes.find(x => x.AttributeName === 'default-vpc');
        if (defaultVpcAttribute) {
            for (const valueContainer of defaultVpcAttribute.AttributeValues) {
                const vpcId = valueContainer.AttributeValue;
                if (vpcId === 'none') continue;

                LOGGER.info({ 'method': 'before deleteVpc', vpcId });
                await deleteVpc(service, vpcId);
            }
        }
        
        LOGGER.info({ 'method': 'done create handler', model });
        return Promise.resolve(model);
    }

    @handlerEvent(Action.Update)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async update(action: Action, args: HandlerArgs<ResourceModel>, service: EC2): Promise<ResourceModel> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;

        LOGGER.info({ 'method': 'update handler - noop' });

        return Promise.resolve(desiredResourceState);
    }

    @handlerEvent(Action.Delete)
    @commonAws({ serviceName: 'EC2', debug: true })
    public async delete(action: Action, args: HandlerArgs<ResourceModel>, service: EC2): Promise<null> {
        const { desiredResourceState, logicalResourceIdentifier } = args.request;

        LOGGER.info({ 'method': 'before delete handler', desiredResourceState, logicalResourceIdentifier });

        await service.createDefaultVpc({}).promise();

        LOGGER.info({ 'method': 'after delete handler' });
        return Promise.resolve(null);
    }

}

const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

export const entrypoint = resource.entrypoint;

export const testEntrypoint = resource.testEntrypoint;