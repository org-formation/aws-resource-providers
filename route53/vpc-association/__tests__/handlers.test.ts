import { Route53 } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, OperationStatus, SessionProxy } from 'cfn-rpdk';
import createFixture from './data/create-success.json';
import deleteFixture from './data/delete-success.json';
import updateFixture from './data/update-success.json';
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
        route53.mock('associateVPCWithHostedZone').resolve({
            ChangeInfo: {
                Id: 'someId',
                Status: 'PENDING',
                SubmittedAt: new Date(),
                Comment: '',
            },
        });
        route53.mock('disassociateVPCFromHostedZone').resolve({
            ChangeInfo: {
                Id: 'someId',
                Status: 'PENDING',
                SubmittedAt: new Date(),
                Comment: '',
            },
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
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject({ ...request.desiredResourceState, ResourceId: 'Z123456789012345678/us-east-1/v-12345678901234567' });
    });

    test('update operation successful - vpc association', async () => {
        const request = fixtureMap.get(Action.Update);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('delete operation successful - vpc association', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('all operations fail without session - vpc association', async () => {
        expect.assertions(fixtureMap.size);
        spySession.mockReturnValue(null);
        for (const [action, request] of fixtureMap) {
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action, request }, null);
            console.log(JSON.stringify(progress));
            expect(progress.errorCode).toBe(exceptions.InvalidCredentials.name);
        }
    });
});
