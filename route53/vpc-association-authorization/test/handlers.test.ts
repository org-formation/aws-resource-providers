import { Route53 } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, OperationStatus, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
const deleteFixture = require('./data/delete-success');
const createFixture = require('./data/create-success');
const updateFixture = require('./data/update-success');
import { resource } from '../src/handlers';

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let route53: AwsServiceMockBuilder<Route53>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        route53 = on(Route53, { snapshot: false });
        route53.mock('createVPCAssociationAuthorization').resolve({
            HostedZoneId: 'Z123456789012345678',
            VPC: {
                VPCRegion: 'us-east-1',
                VPCId: 'v-12345678901234567',
            },
        });
        route53.mock('deleteVPCAssociationAuthorization').resolve({});
        route53.mock('listVPCAssociationAuthorizations').resolve({
            VPCs: [
                {
                    VPCRegion: 'us-east-1',
                    VPCId: 'v-12345678901234567',
                },
            ],
        });
        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(route53.instance);
        testEntrypointPayload = {
            credentials: { accessKeyId: '', secretAccessKey: '', sessionToken: '' },
            region: 'us-east-1',
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('create operation successful - vpc association', async () => {
        const request = fixtureMap.get(Action.Create)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request });
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel?.serialize()).toMatchObject({ ...request.desiredResourceState, ResourceId: 'Z123456789012345678/us-east-1/v-12345678901234567' });
    });

    test('create operation fail - retry later', async () => {
        const mockGet = route53.mock('createVPCAssociationAuthorization').reject({
            ...new Error(),
            message: "A conflicting modification to the authorizations in place",
            code: 'ConcurrentModification',
        });
        spySessionClient.mockReturnValue(route53.instance);

        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.InProgress });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('create operation fail', async () => {
        const mockGet = route53.mock('createVPCAssociationAuthorization').reject({
            ...new Error(),
            message: "Some other failure",
            code: 'InternalFailure',
        });
        spySessionClient.mockReturnValue(route53.instance);

        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, undefined);
        expect(progress).toMatchObject({ status: OperationStatus.Failed });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });


    test('update operation successful - vpc association', async () => {
        const request = fixtureMap.get(Action.Update)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request });
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel?.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('delete operation successful - vpc association', async () => {
        const request = fixtureMap.get(Action.Delete)!;
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request });
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

});
