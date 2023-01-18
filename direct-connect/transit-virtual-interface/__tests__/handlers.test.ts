import { Action, exceptions, OperationStatus, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { AwsServiceMockBuilder, on } from '@jurijzahn8019/aws-promise-jest-mock';
import { DirectConnect } from 'aws-sdk';
import { resource } from '../src/handlers';
const deleteFixture = require('./data/delete-success');
const readFixture = require('./data/read-success');
const updateFixture = require('./data/update-success');
const createFixture = require('./data/create-success');

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let directConnect: AwsServiceMockBuilder<DirectConnect>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        directConnect = on(DirectConnect, { snapshot: false });
        directConnect.mock('createTransitVirtualInterface').resolve({
            virtualInterface: {
                connectionId: "some-connection-id",
                virtualInterfaceName: "some-interface-name",
                vlan: 123,
                asn: 123,
                directConnectGatewayId: "some-direct-connect-gateway",
                virtualInterfaceId: "some-interface-id",
                siteLinkEnabled: false,
                amazonAddress: "some-amazone-address",
                customerAddress: "some-customer-address",
                mtu: 1500,
                ownerAccount: '123456789012',
            }
        });
        directConnect.mock('updateVirtualInterfaceAttributes').resolve({
            virtualInterfaceName: "some-interface-name2",
            mtu: 8500,
            siteLinkEnabled: true,
            connectionId: "some-connection-id",
            vlan: 123,
            asn: 123,
            directConnectGatewayId: "some-direct-connect-gateway",
            virtualInterfaceId: "some-interface-id",
            amazonAddress: "some-amazone-address",
            customerAddress: "some-customer-address",
            ownerAccount: '123456789012',
        });
        directConnect.mock('deleteVirtualInterface').resolve({
            virtualInterfaceState: "pending"
        });
        directConnect.mock('describeTags').resolve({
            resourceTags: []
        });
        directConnect.mock('tagResource').resolve({});
        directConnect.mock('describeVirtualInterfaces').resolve({
            virtualInterfaces: [
                {
                    connectionId: "some-connection-id",
                    virtualInterfaceName: "some-interface-name",
                    vlan: 123,
                    asn: 123,
                    directConnectGatewayId: "some-direct-connect-gateway",
                    virtualInterfaceId: "some-interface-id",
                    siteLinkEnabled: false,
                    amazonAddress: "some-amazone-address",
                    customerAddress: "some-customer-address",
                    mtu: 1500,
                    ownerAccount: '123456789012',
                }
            ]
        });
        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(directConnect.instance);
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

    test('create operation successful - direct connect transit virtual interface', async () => {
        const request = fixtureMap.get(Action.Create)!;
        const describeConnMock = directConnect.mock('describeConnections').resolve({
            connections: [
                {
                    vlan: 123,
                }
            ]
        });
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.InProgress, message: '', callbackDelaySeconds: 60 });
        expect(progress.resourceModel).toBeDefined();
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
            VirtualInterfaceId: 'some-interface-id',
        });
        expect(progress.callbackContext).toMatchObject({ id: 'some-interface-id' });
        expect(describeConnMock.mock).toHaveBeenCalledTimes(1);
    });

    test('create operation fail - code commit approval rule template', async () => {
        expect.assertions(2);
        const mockCreate = directConnect.mock('describeConnections').reject({
            ...new Error(),
            code: 'InternalFailure',
        });
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockCreate.mock).toHaveBeenCalledTimes(1);
    });

    test('update operation successful - direct connect transit virtual interface', async () => {
        const request = fixtureMap.get(Action.Update)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.InProgress, message: '', callbackDelaySeconds: 60 });
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
            OwnerAccount: '123456789012',
        });
        expect(progress.callbackContext).toMatchObject({ id: 'some-interface-id' });
    });

    test('delete operation successful - direct connect transit virtual interface', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.InProgress, message: '', callbackDelaySeconds: 60 });
        expect(progress.callbackContext).toMatchObject({ id: 'some-interface-id' });
    });

    test('delete operation fail - direct connect transit virtual interface', async () => {
        expect.assertions(2);
        const mockGet = directConnect.mock('deleteVirtualInterface').reject({
            ...new Error(),
            code: 'InternalFailure',
        });
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful - direct connect transit virtual interface', async () => {
        const request = fixtureMap.get(Action.Read)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
            OwnerAccount: '123456789012',
        });
    });

    test('read operation fail - direct connect transit virtual interface', async () => {
        expect.assertions(2);
        const mockGet = directConnect.mock('describeVirtualInterfaces').reject({
            ...new Error(),
            code: 'InternalFailure',
        });
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

});
