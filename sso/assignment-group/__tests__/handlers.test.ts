import { on, AwsServiceMockBuilder, AwsFunctionMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { SSOAdmin } from 'aws-sdk';
import { Action, exceptions, OperationStatus, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import createFixture from './data/create-success.json';
import deleteFixture from './data/delete-success.json';
import readFixture from './data/read-success.json';
import updateFixture from './data/update-success.json';
import { resource } from '../src/handlers';

const IDENTIFIER = '8f9be413-f9cc-49a1-b901-0a59a6f126c2';

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
    let ssoAdmin: AwsServiceMockBuilder<SSOAdmin>;
    let createAccountAssignmentMock: AwsFunctionMockBuilder<SSOAdmin>;
    let deleteAccountAssignmentMock: AwsFunctionMockBuilder<SSOAdmin>;
    let listAccountAssignmentsMock: AwsFunctionMockBuilder<SSOAdmin>;
    let describeAccountAssignmentDeletionStatusMock: AwsFunctionMockBuilder<SSOAdmin>;
    let describeAccountAssignmentCreationStatusMock: AwsFunctionMockBuilder<SSOAdmin>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
    });

    beforeEach(async () => {
        ssoAdmin = on(SSOAdmin, { snapshot: false });
        createAccountAssignmentMock = ssoAdmin.mock('createAccountAssignment').resolve({ AccountAssignmentCreationStatus: { RequestId: 'abcdef', Status: 'SUCCEEDED' } });
        deleteAccountAssignmentMock = ssoAdmin.mock('deleteAccountAssignment').resolve({ AccountAssignmentDeletionStatus: { RequestId: 'abcdef', Status: 'SUCCEEDED' } });
        listAccountAssignmentsMock = ssoAdmin.mock('listAccountAssignments').resolve({
            AccountAssignments: [
                {
                    PrincipalId: '123123',
                    PrincipalType: 'GROUP',
                },
            ],
        });
        describeAccountAssignmentDeletionStatusMock = ssoAdmin.mock('describeAccountAssignmentDeletionStatus').resolve({ AccountAssignmentDeletionStatus: { RequestId: 'abcdef', Status: 'SUCCESS' } });
        describeAccountAssignmentCreationStatusMock = ssoAdmin.mock('describeAccountAssignmentCreationStatus').resolve({ AccountAssignmentCreationStatus: { RequestId: 'abcdef', Status: 'SUCCESS' } });
        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(ssoAdmin.instance);
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

    test('create will create account assignment for each principal x target', async () => {
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject({
            ...request.desiredResourceState,
            ResourceId: `arn:community::123456789012:principal-assignments:GROUP:123123/${IDENTIFIER}`,
        });
        expect(createAccountAssignmentMock.mock).toHaveBeenCalledTimes(1);
        expect(deleteAccountAssignmentMock.mock).toHaveBeenCalledTimes(0);
    });

    test('update will create and remove account assignment for each principal x target', async () => {
        const request = fixtureMap.get(Action.Update);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
        expect(createAccountAssignmentMock.mock).toHaveBeenCalledTimes(1);
        expect(deleteAccountAssignmentMock.mock).toHaveBeenCalledTimes(1);
    });

    test('update will create and remove account assignment for each principal x target', async () => {
        const request = fixtureMap.get(Action.Update);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
        expect(createAccountAssignmentMock.mock).toHaveBeenCalledTimes(1);
        expect(deleteAccountAssignmentMock.mock).toHaveBeenCalledTimes(1);
    });

    test('delete operation successful - sso assignment group', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('read operation successful - sso assignment group', async () => {
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('all operations fail without session - sso assignment group', async () => {
        expect.assertions(fixtureMap.size);
        spySession.mockReturnValue(null);
        for (const [action, request] of fixtureMap) {
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action, request }, null);
            expect(progress.errorCode).toBe(exceptions.InvalidCredentials.name);
        }
    });
});
