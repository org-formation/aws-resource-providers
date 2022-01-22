import { EC2 } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, SessionProxy, OperationStatus } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import createFixture from './data/create-success.json';
import readFixture from './data/read-success.json';
import deleteFixture from './data/delete-success.json';
import { resource } from '../src/handlers';

const IDENTIFIER = '4b90a7e4-b790-456b-a937-0cfdfa211dfe';

jest.mock('aws-sdk');
jest.mock('uuid', () => {
    return {
        v4: () => IDENTIFIER,
    };
});

describe('when calling handler', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let ec2: AwsServiceMockBuilder<EC2>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        ec2 = on(EC2, { snapshot: false });
        ec2.mock('createDefaultVpc').resolve({});
        ec2.mock('describeAccountAttributes').resolve({
            AccountAttributes: [
                {
                    AttributeName: 'default-vpc',
                    AttributeValues: [
                        {
                            AttributeValue: 'vpc-1a2b3c4d',
                        },
                    ],
                },
            ],
        });
        ec2.mock('describeNetworkInterfaces').resolve({ NetworkInterfaces: [] });
        ec2.mock('describeInternetGateways').resolve({ InternetGateways: [] });
        ec2.mock('describeRouteTables').resolve({ RouteTables: [] });
        ec2.mock('describeNetworkAcls').resolve({ NetworkAcls: [] });
        ec2.mock('describeSubnets').resolve({ Subnets: [] });
        ec2.mock('describeSecurityGroups').resolve({ SecurityGroups: [] });
        ec2.mock('deleteVpc').resolve({});

        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(ec2.instance);
        testEntrypointPayload = {
            credentials: { accessKeyId: '', secretAccessKey: '', sessionToken: '' },
            region: 'us-east-1',
            action: 'CREATE',
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('create operation successful - ec2 no default vpc', async () => {
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        const resourceId = `arn:community:us-east-1:123456789012:ec2:no-default-vpc/${IDENTIFIER}`;
        expect(progress.resourceModel.serialize()).toMatchObject({ ...request.desiredResourceState, ResourceId: resourceId });
    });

    test('create operation fail already exists - ec2 no default vpc', async () => {
        const mockDescribe = ec2.mock('describeAccountAttributes').resolve({
            AccountAttributes: [
                {
                    AttributeName: 'default-vpc',
                    AttributeValues: [
                        {
                            AttributeValue: 'none',
                        },
                    ],
                },
            ],
        });
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.AlreadyExists.name });
        expect(mockDescribe.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful - ec2 no default vpc', async () => {
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('delete operation successful - ec2 no default vpc', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('delete operation fail not found - ec2 no default vpc', async () => {
        const mockCreate = ec2.mock('createDefaultVpc').reject({
            ...new Error(),
            code: 'DefaultVpcAlreadyExists',
        });
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.NotFound.name });
        expect(mockCreate.mock).toHaveBeenCalledTimes(1);
    });

    test('all operations fail without session - ec2 no default vpc', async () => {
        expect.assertions(fixtureMap.size);
        spySession.mockReturnValue(null);
        for (const [action, request] of fixtureMap) {
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action, request }, null);
            expect(progress.errorCode).toBe(exceptions.InvalidCredentials.name);
        }
    });
});
