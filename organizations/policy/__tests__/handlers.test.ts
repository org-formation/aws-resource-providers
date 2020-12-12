import { Organizations } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, OperationStatus, SessionProxy } from 'cfn-rpdk';
import createFixture from './data/create-success.json';
import deleteFixture from './data/delete-success.json';
import readFixture from './data/read-success.json';
import updateFixture from './data/update-success.json';
import { resource } from '../src/handlers';

const IDENTIFIER = '9c9ff813-e56a-4690-a340-56e760897f13';

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let organizations: AwsServiceMockBuilder<Organizations>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        organizations = on(Organizations, { snapshot: false });
        organizations.mock('describePolicy').resolve({
            Policy: {
                PolicySummary: {
                    Id: IDENTIFIER,
                    Name: 'AiGlobalOptOut',
                    Type: 'AISERVICES_OPT_OUT_POLICY',
                },
                Content:
                    '{"services":{"@@operators_allowed_for_child_policies":["@@none"],"default":{"@@operators_allowed_for_child_policies":["@@none"],"opt_out_policy":{"@@operators_allowed_for_child_policies":["@@none"],"@@assign":"optOut"}}}}',
            },
        });
        organizations.mock('listTargetsForPolicy').resolve({
            Targets: [{ TargetId: IDENTIFIER }],
        });
        organizations.mock('createPolicy').resolve({
            Policy: {
                PolicySummary: {
                    Id: IDENTIFIER,
                    Name: 'AiGlobalOptOut',
                    Type: 'AISERVICES_OPT_OUT_POLICY',
                },
                Content:
                    '{"services":{"@@operators_allowed_for_child_policies":["@@none"],"default":{"@@operators_allowed_for_child_policies":["@@none"],"opt_out_policy":{"@@operators_allowed_for_child_policies":["@@none"],"@@assign":"optOut"}}}}',
            },
        });
        organizations.mock('attachPolicy').resolve({});
        organizations.mock('updatePolicy').resolve({});
        organizations.mock('detachPolicy').resolve({});
        organizations.mock('deletePolicy').resolve({});
        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(organizations.instance);
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

    test('create operation successful - organizations policy', async () => {
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject({
            ...request.desiredResourceState,
            ResourceId: IDENTIFIER,
        });
    });

    test('create operation fail already exists - organizations policy', async () => {
        const mockCreate = organizations.mock('createPolicy').reject({
            ...new Error(),
            code: 'DuplicatePolicyException',
        });
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.AlreadyExists.name });
        expect(mockCreate.mock).toHaveBeenCalledTimes(1);
    });

    test('update operation successful - organizations policy', async () => {
        const request = fixtureMap.get(Action.Update);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('delete operation successful - organizations policy', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('delete operation fail not found - organizations policy', async () => {
        const mockGet = organizations.mock('deletePolicy').reject({
            ...new Error(),
            code: 'PolicyNotFoundException',
        });
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.NotFound.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful - organizations policy', async () => {
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('read operation  fail not found - organizations policy', async () => {
        expect.assertions(4);
        const mockGet = organizations.mock('listTargetsForPolicy').reject({
            ...new Error(),
            code: 'PolicyNotFoundException',
        });
        const spyRetrieve = jest.spyOn<any, any>(resource, 'listPolicyTargets');
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.NotFound.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveReturned();
    });

    test('all operations fail without session - organizations policy', async () => {
        expect.assertions(fixtureMap.size);
        spySession.mockReturnValue(null);
        for (const [action, request] of fixtureMap) {
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action, request }, null);
            expect(progress.errorCode).toBe(exceptions.InvalidCredentials.name);
        }
    });
});
