import { SecurityHub } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, OperationStatus, SessionProxy } from 'cfn-rpdk';
import createFixture from './data/create-success.json';
import deleteFixture from './data/delete-success.json';
import readFixture from './data/read-success.json';
import updateFixture from './data/update-success.json';
import { resource } from '../src/handlers';

const IDENTIFIER = 'arn:aws:securityhub:us-east-1:123456789012:action/custom/test';

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let securityhub: AwsServiceMockBuilder<SecurityHub>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        securityhub = on(SecurityHub, { snapshot: false });
        securityhub.mock('describeActionTargets').resolve({
            ActionTargets: [
                {
                    ActionTargetArn: IDENTIFIER,
                    Name: 'test',
                    Description: 'test',
                },
            ],
        });
        securityhub.mock('createActionTarget').resolve({
            ActionTargetArn: IDENTIFIER,
        });
        securityhub.mock('updateActionTarget').resolve({});
        securityhub.mock('deleteActionTarget').resolve({});
        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(securityhub.instance);
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

    test('create operation successful - security hub action target', async () => {
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject({
            ...request.desiredResourceState,
            Arn: IDENTIFIER,
        });
    });

    test('create operation fail already exists - security hub action target', async () => {
        const mockCreate = securityhub.mock('createActionTarget').reject({
            ...new Error(),
            code: 'ResourceConflictException',
        });
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.AlreadyExists.name });
        expect(mockCreate.mock).toHaveBeenCalledTimes(1);
    });

    test('update operation successful - security hub action target', async () => {
        const request = fixtureMap.get(Action.Update);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('update operation fail not found - security hub action target', async () => {
        const mockGet = securityhub.mock('updateActionTarget').reject({
            ...new Error(),
            code: 'ResourceNotFoundException',
        });
        const request = fixtureMap.get(Action.Update);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.NotFound.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('delete operation successful - security hub action target', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('delete operation fail not found - security hub action target', async () => {
        const mockGet = securityhub.mock('deleteActionTarget').reject({
            ...new Error(),
            code: 'ResourceNotFoundException',
        });
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.NotFound.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful - security hub action target', async () => {
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('read operation  fail not found - security hub action target', async () => {
        const mockGet = securityhub.mock('describeActionTargets').reject({
            ...new Error(),
            code: 'ResourceNotFoundException',
        });
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.NotFound.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
    });

    test('all operations fail without session - security hub action target', async () => {
        expect.assertions(fixtureMap.size);
        spySession.mockReturnValue(null);
        for (const [action, request] of fixtureMap) {
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action, request }, null);
            expect(progress.errorCode).toBe(exceptions.InvalidCredentials.name);
        }
    });
});
