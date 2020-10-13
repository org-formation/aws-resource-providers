import { CodeCommit } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, OperationStatus, SessionProxy } from 'cfn-rpdk';
import createFixture from '../sam-tests/create.json';
import deleteFixture from '../sam-tests/delete.json';
import readFixture from '../sam-tests/read.json';
import updateFixture from '../sam-tests/update.json';
import { resource } from '../src/handlers';

const IDENTIFIER = 'arn:community:codecommit:us-east-1:123456789012:repository-association/4b90a7e4-b790-456b-a937-0cfdfa211dfe';

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let codecommit: AwsServiceMockBuilder<CodeCommit>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        codecommit = on(CodeCommit, { snapshot: false });
        codecommit.mock('batchAssociateApprovalRuleTemplateWithRepositories').resolve({});
        codecommit.mock('batchDisassociateApprovalRuleTemplateFromRepositories').resolve({});
        codecommit.mock('listRepositoriesForApprovalRuleTemplate').resolve({});
        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(codecommit.instance);
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

    test('create operation successful - code commit repository association', async () => {
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
        expect(progress.resourceModel.serialize()).toMatchObject({
            ...request.desiredResourceState,
            Arn: IDENTIFIER,
        });
    });

    test('update operation successful - code commit repository association', async () => {
        const request = fixtureMap.get(Action.Update);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, null);
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('delete operation successful - code commit repository association', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
        expect(progress.resourceModel).toBeNull();
    });

    test('read operation successful - code commit repository association', async () => {
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('all operations fail without session - code commit repository association', async () => {
        expect.assertions(fixtureMap.size);
        spySession.mockReturnValue(null);
        for (const [action, request] of fixtureMap) {
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action, request }, null);
            expect(progress.errorCode).toBe(exceptions.InvalidCredentials.name);
        }
    });
});
