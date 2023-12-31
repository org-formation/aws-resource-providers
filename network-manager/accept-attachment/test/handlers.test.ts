import { Action, OperationStatus, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { AwsServiceMockBuilder, on } from '@jurijzahn8019/aws-promise-jest-mock';
import { NetworkManager } from 'aws-sdk';
import { resource } from '../src/handlers';

const createSuccess = require('./fixtures/create_success');
const readVpcSuccess = require('./fixtures/read_vpc_success');

let fixtureMap = new Map<Action, Record<string, any>>();
fixtureMap.set(Action.Create, createSuccess);
fixtureMap.set(Action.Read, readVpcSuccess);

jest.mock('aws-sdk');

describe('network manager accept attachment', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let networkManager: AwsServiceMockBuilder<NetworkManager>;

    beforeEach(async () => {
        networkManager = on(NetworkManager, { snapshot: false });
        networkManager.mock('acceptAttachment').resolve({});
        networkManager.mock('getVpcAttachment').resolve({});
        networkManager.mock('getConnectAttachment').resolve({});
        networkManager.mock('getSiteToSiteVpnAttachment').resolve({});
        networkManager.mock('getTransitGatewayRouteTableAttachment').resolve({});

        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(networkManager.instance);
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

    describe('create operation', () => {
        const request = fixtureMap.get(Action.Create)!;

        test('initial create runs acceptAttachment call when acceptance is pending attachment', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').resolve({
                VpcAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'VPC',
                        State: 'PENDING_ATTACHMENT_ACCEPTANCE',
                    }
                }
            });         
            
            const acceptAttachmentMock = networkManager.mock('acceptAttachment').resolve({
                Attachment: {
                    AttachmentId:'some-id',
                    AttachmentType: 'VPC',
                    State: 'PENDING',
                },
            });

            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request, callbackContext:{ id: undefined}}, undefined);
            expect(progress).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(acceptAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(progress.status).toEqual(OperationStatus.InProgress);
        });

        test('initial create runs acceptAttachment call when acceptance is pending tag', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').resolve({
                VpcAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'VPC',
                        State: 'PENDING_TAG_ACCEPTANCE',
                    }
                }
            });         
            
            const acceptAttachmentMock = networkManager.mock('acceptAttachment').resolve({
                Attachment: {
                    AttachmentId:'some-id',
                    AttachmentType: 'VPC',
                    State: 'PENDING',
                },
            });

            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request, callbackContext:{ id: undefined}}, undefined);
            expect(progress).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(acceptAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(progress.status).toEqual(OperationStatus.InProgress);
        });

        test('initial create skips acceptAttachment call when acceptance is AVAILABLE', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').resolve({
                VpcAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'VPC',
                        State: 'AVAILABLE',
                    }
                }
            });  
            
            const acceptAttachmentMock = networkManager.mock('acceptAttachment').resolve({
                Attachment: {
                    AttachmentId:'some-id',
                    AttachmentType: 'VPC',
                    State: 'AVAILABLE',
                },
            });

            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request, callbackContext:{ id: undefined}}, undefined);
            expect(progress).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(acceptAttachmentMock.mock).toHaveBeenCalledTimes(0);
            expect(progress.status).toEqual(OperationStatus.Success);
        });

        test('initial create skips acceptAttachment call when acceptance in a waiting state', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').resolve({
                VpcAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'VPC',
                        State: 'CREATING',
                    }
                }
            });  
            
            const acceptAttachmentMock = networkManager.mock('acceptAttachment').resolve({
                Attachment: {
                    AttachmentId:'some-id',
                    AttachmentType: 'VPC',
                    State: 'PENDING',
                },
            });

            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request, callbackContext:{ id: undefined}}, undefined);
            expect(progress).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(acceptAttachmentMock.mock).toHaveBeenCalledTimes(0);
            expect(progress.status).toEqual(OperationStatus.InProgress);
        });

        test('IN_PROGRESS create call with incorrect type fails', async () => {
        const vpcAttach = networkManager.mock('getVpcAttachment').resolve({});
        const connectAttach = networkManager.mock('getConnectAttachment').resolve({});
        const siteAttach = networkManager.mock('getSiteToSiteVpnAttachment').resolve({});
        const transitAttach = networkManager.mock('getTransitGatewayRouteTableAttachment').resolve({});

            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request, callbackContext:{ id: 'some-id', type: 'broken-type'}}, undefined);
            expect(progress).toBeDefined();
            expect(vpcAttach.mock).toHaveBeenCalledTimes(0);
            expect(connectAttach.mock).toHaveBeenCalledTimes(0);
            expect(siteAttach.mock).toHaveBeenCalledTimes(0);
            expect(transitAttach.mock).toHaveBeenCalledTimes(0);

            expect(progress.status).toEqual(OperationStatus.Failed);
        });

        test('IN_PROGRESS create call will getAttachment state pending', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').resolve({
                VpcAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'VPC',
                        State: 'PENDING',
                    }
                }
            });

            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request, callbackContext:{ id: 'some-id', type: 'VPC'}}, undefined);
            expect(progress).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(progress.status).toEqual(OperationStatus.InProgress);
        });

        test('IN_PROGRESS create call will getAttachment state available', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').resolve({
                VpcAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'VPC',
                        State: 'AVAILABLE',
                    }
                }
            });

            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request, callbackContext:{ id: 'some-id', type: 'VPC'}}, undefined);
            expect(progress).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(progress.resourceModel?.id).toEqual(request.desiredResourceState.AttachmentId);
            expect(progress.resourceModel?.id).toEqual(request.desiredResourceState.AttachmentId);
            expect(progress.status).toEqual(OperationStatus.Success);
        });

        test('IN_PROGRESS create call will getAttachment state failed', async () => {
            const getConnectAttachment = networkManager.mock('getConnectAttachment').resolve({
                ConnectAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'CONNECT',
                        State: 'FAILED',
                    }
                }
            });

            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request, callbackContext:{ id: 'some-id', type: 'CONNECT'}}, undefined);
            expect(progress).toBeDefined();
            expect(getConnectAttachment.mock).toHaveBeenCalledTimes(1);
            expect(progress.status).toEqual(OperationStatus.Failed);
        });
    });

    describe('update operation',  () => {
        const request = fixtureMap.get(Action.Read)!;

        test('reading vpc attachment', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').resolve({
                VpcAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'VPC',
                        State: 'AVAILABLE',
                    }
                }
            });

            const result = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request, model: { attachemtType: 'VPC'}}, undefined);
            expect(result).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(result.resourceModel?.id).toEqual(request.desiredResourceState.AttachmentId);
        });

        test('reading attachment fails', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').reject({
                ...new Error(),
                code: 'InternalFailure',
            });
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request, callbackContext:{ id: undefined}}, undefined);
            expect(progress).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(progress.status).toEqual(OperationStatus.Failed);
        });

    describe('read operation',  () => {
        const request = fixtureMap.get(Action.Read)!;

        test('reading vpc attachment', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').resolve({
                VpcAttachment: {
                    Attachment: {
                        AttachmentId:'some-id',
                        AttachmentType: 'VPC',
                        State: 'AVAILABLE',
                    }
                }
            });

            const result = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request, model: { attachemtType: 'VPC'}}, undefined);
            expect(result).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(result.resourceModel?.id).toEqual(request.desiredResourceState.AttachmentId);
        });

        test('reading attachment fails', async () => {
            const getVpcAttachmentMock = networkManager.mock('getVpcAttachment').reject({
                ...new Error(),
                code: 'InternalFailure',
            });
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request, callbackContext:{ id: undefined}}, undefined);
            expect(progress).toBeDefined();
            expect(getVpcAttachmentMock.mock).toHaveBeenCalledTimes(1);
            expect(progress.status).toEqual(OperationStatus.Failed);
        });
    });
});
