import { Action, exceptions, OperationStatus, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { AwsServiceMockBuilder, on } from '@jurijzahn8019/aws-promise-jest-mock';
import { EC2, NetworkManager } from 'aws-sdk';
import { resource } from '../src/handlers';
const deleteFixture = require('./data/delete-success');
const createNoWaitFixture = require('./data/create-no-wait');
const createWaitFixture = require('./data/create-wait');
const createInvalidFixture = require('./data/create-wait-invalid');
const readFixture = require('./data/read-success');

jest.mock('aws-sdk');

describe('core network route', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let ec2: AwsServiceMockBuilder<EC2>;
    let nm: AwsServiceMockBuilder<NetworkManager>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createNoWaitFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        ec2 = on(EC2, { snapshot: false });
        ec2.mock('createRoute').resolve({ Return: true });
        ec2.mock('replaceRoute').resolve({});
        ec2.mock('deleteRoute').resolve({});
        nm = on(NetworkManager, { snapshot: false });
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

    test('create immediate successful', async () => {
        const request = fixtureMap.get(Action.Create)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeDefined();
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
            Id: 'some-route-table:192.168.0.0/22:undefined:some-core-network'
        });
    });

    test('create waiting first call', async () => {
        const request = createWaitFixture;
        nm.mock('getVpcAttachment').resolve({ VpcAttachment: { Attachment: { State: "PENDING_ATTACHMENT_ACCEPTANCE" } } });
        spySessionClient.mockReturnValue(nm.instance);

        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.InProgress, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeDefined();
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
        });
        console.log(JSON.stringify(progress, null, 2));
        expect(progress.callbackContext?.timeStarted).toBeDefined()
    });

    test('create waiting invalid input', async () => {
        const request = createInvalidFixture
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, message: 'If you provide maxWaitSeconds, you MUST provide vpcAttachmentId', callbackDelaySeconds: 0 });
    });

    test('create waiting second call in progress', async () => {
        const request = createWaitFixture
        const fiveSecondsAgo = new Date().getTime() / 1000 - 5;
        testEntrypointPayload.callbackContext = { timeStarted: fiveSecondsAgo }
        nm.mock('getVpcAttachment').resolve({ VpcAttachment: { Attachment: { State: "PENDING_ATTACHMENT_ACCEPTANCE" } } });
        spySessionClient.mockReturnValue(nm.instance);

        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.InProgress, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeDefined();
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
        });
        console.log(JSON.stringify(progress, null, 2));
        expect(progress.callbackContext?.timeStarted).toBe(fiveSecondsAgo)
    });

    test('create waiting waited too long', async () => {
        const request = createWaitFixture
        const hundredSecondsAgo = new Date().getTime() / 1000 - 100;
        testEntrypointPayload.callbackContext = { timeStarted: hundredSecondsAgo }
        nm.mock('getVpcAttachment').resolve({ VpcAttachment: { Attachment: { State: "PENDING_ATTACHMENT_ACCEPTANCE" } } });
        spySessionClient.mockReturnValue(nm.instance);

        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, message: 'VPC Attachment some-attachment is (still) in state PENDING_ATTACHMENT_ACCEPTANCE after waiting to reach state AVAILABLE for 100 seconds which is longer than the maximum configured of 60.', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeDefined();
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
        });
        console.log(JSON.stringify(progress, null, 2));
    });

    test('create operation fail', async () => {
        expect.assertions(2);
        const mockCreate = ec2.mock('createRoute').reject({
            ...new Error(),
            code: 'InternalFailure',
        });
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockCreate.mock).toHaveBeenCalledTimes(1);
    });

    test('delete operation successful', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('delete operation fail', async () => {
        expect.assertions(2);
        const mockGet = ec2.mock('deleteRoute').reject({
            ...new Error(),
            code: 'InternalFailure',
        });
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful', async () => {
        const request = fixtureMap.get(Action.Read)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel!.serialize()).toMatchObject({
            ...request.desiredResourceState,
            DestinationCidrBlock: "192.168.0.0/22",
            RouteTableId: "some-route-table",
            CoreNetworkArn: "some-core-network"
        });
    });

});
