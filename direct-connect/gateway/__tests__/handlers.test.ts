import { Action, exceptions, OperationStatus, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { AwsServiceMockBuilder, on } from '@jurijzahn8019/aws-promise-jest-mock';
import { DirectConnect } from 'aws-sdk';
import { resource } from '../src/handlers';
import createFixture from './data/create-success.json';
import deleteFixture from './data/delete-success.json';
import readFixture from './data/read-success.json';
import updateFixture from './data/update-success.json';

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
        directConnect.mock('createDirectConnectGateway').resolve({
            directConnectGateway: {
                directConnectGatewayId: 'ecc5e2e3-9bf4-4589-8759-8e788983c1fb',
                directConnectGatewayName: 'test',
                amazonSideAsn: 64512,
                ownerAccount: '123456789012',
            },
        });
        directConnect.mock('updateDirectConnectGateway').resolve({
            directConnectGateway: {
                directConnectGatewayId: 'ecc5e2e3-9bf4-4589-8759-8e788983c1fb',
                directConnectGatewayName: 'test2',
                amazonSideAsn: 64512,
                ownerAccount: '123456789012',
            },
        });
        directConnect.mock('deleteDirectConnectGateway').resolve({
            directConnectGateway: {
                directConnectGatewayId: 'ecc5e2e3-9bf4-4589-8759-8e788983c1fb',
                directConnectGatewayName: 'test',
                amazonSideAsn: 64512,
                ownerAccount: '123456789012',
            },
        });
        directConnect.mock('describeDirectConnectGateways').resolve({
            directConnectGateways: [
                {
                    directConnectGatewayId: 'ecc5e2e3-9bf4-4589-8759-8e788983c1fb',
                    directConnectGatewayName: 'test',
                    amazonSideAsn: 64512,
                    ownerAccount: '123456789012',
                },
            ],
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

    test('create operation successful - direct connect gateway', async () => {
        const request = fixtureMap.get(Action.Create)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeDefined();
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
            DirectConnectGatewayId: 'ecc5e2e3-9bf4-4589-8759-8e788983c1fb',
            OwnerAccount: '123456789012',
        });
    });

    test('create operation fail - code commit approval rule template', async () => {
        expect.assertions(2);
        const mockCreate = directConnect.mock('createDirectConnectGateway').reject({
            ...new Error(),
            code: 'InternalFailure',
        });
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockCreate.mock).toHaveBeenCalledTimes(1);
    });

    test('update operation successful - direct connect gateway', async () => {
        const request = fixtureMap.get(Action.Update)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
            DirectConnectGatewayId: 'ecc5e2e3-9bf4-4589-8759-8e788983c1fb',
            AmazonSideAsn: 64512,
            OwnerAccount: '123456789012',
        });
    });

    test('delete operation successful - direct connect gateway', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('delete operation fail - direct connect gateway', async () => {
        expect.assertions(2);
        const mockGet = directConnect.mock('deleteDirectConnectGateway').reject({
            ...new Error(),
            code: 'InternalFailure',
        });
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful - direct connect gateway', async () => {
        const request = fixtureMap.get(Action.Read)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
            DirectConnectGatewayName: 'test',
            AmazonSideAsn: 64512,
            OwnerAccount: '123456789012',
        });
    });

    test('read operation fail - direct connect gateway', async () => {
        expect.assertions(2);
        const mockGet = directConnect.mock('describeDirectConnectGateways').reject({
            ...new Error(),
            code: 'InternalFailure',
        });
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('all operations fail without session - direct connect gateway', async () => {
        expect.assertions(fixtureMap.size);
        spySession.mockReturnValue(null);
        for (const [action, request] of fixtureMap) {
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action, request }, undefined);
            expect(progress.errorCode).toBe(exceptions.InvalidCredentials.name);
        }
    });
});
