import { CodeCommit } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, OperationStatus, SessionProxy } from 'cfn-rpdk';
import createFixture from '../sam-tests/create.json';
import deleteFixture from '../sam-tests/delete.json';
import readFixture from '../sam-tests/read.json';
import updateFixture from '../sam-tests/update.json';
import { resource } from '../src/handlers';

const IDENTIFIER = 'arn:community:codecommit:us-east-1:123456789012:repository-association/ecc5e2e3-9bf4-4589-8759-8e788983c1fb';

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
        codecommit.mock('batchAssociateApprovalRuleTemplateWithRepositories').resolve({
            associatedRepositoryNames: [],
            errors: [],
        });
        codecommit.mock('batchDisassociateApprovalRuleTemplateFromRepositories').resolve({
            disassociatedRepositoryNames: [],
            errors: [],
        });
        codecommit.mock('listRepositoriesForApprovalRuleTemplate').resolve({
            repositoryNames: ['repo1', 'repo2'],
        });
        codecommit.mock('getApprovalRuleTemplate').resolve({
            approvalRuleTemplate: {
                approvalRuleTemplateId: 'ecc5e2e3-9bf4-4589-8759-8e788983c1fb',
                approvalRuleTemplateName: 'test',
                approvalRuleTemplateContent: '',
            },
        });
        codecommit.mock('listApprovalRuleTemplates').resolve({
            approvalRuleTemplateNames: ['test', 'test2'],
        });
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
        codecommit.mock('batchAssociateApprovalRuleTemplateWithRepositories').resolve({
            associatedRepositoryNames: ['repo1', 'repo2'],
            errors: [],
        });
        codecommit.mock('listRepositoriesForApprovalRuleTemplate').resolve({ repositoryNames: [] });
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject({
            ...request.desiredResourceState,
            Arn: IDENTIFIER,
        });
    });

    test('create operation fail not found - code commit repository association', async () => {
        expect.assertions(4);
        const mockGet = codecommit.mock('listRepositoriesForApprovalRuleTemplate').reject({
            ...new Error(),
            code: 'ApprovalRuleTemplateDoesNotExistException',
        });
        const spyRetrieve = jest.spyOn<any, any>(resource, 'listRepositoryAssociations');
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.NotFound.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveReturned();
    });

    test('update operation successful - code commit repository association', async () => {
        const request = fixtureMap.get(Action.Update);
        codecommit.mock('batchAssociateApprovalRuleTemplateWithRepositories').resolve({
            associatedRepositoryNames: ['repo1', 'repo3'],
            errors: [],
        });
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('delete operation successful - code commit repository association', async () => {
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('delete operation fail not found - code commit repository association', async () => {
        expect.assertions(4);
        const mockGet = codecommit.mock('listRepositoriesForApprovalRuleTemplate').reject({
            ...new Error(),
            code: 'ApprovalRuleTemplateDoesNotExistException',
        });
        const spyRetrieve = jest.spyOn<any, any>(resource, 'listRepositoryAssociations');
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.NotFound.name });
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveReturned();
    });

    test('delete operation fail generic', async () => {
        expect.assertions(2);
        const mockDelete = codecommit.mock('batchDisassociateApprovalRuleTemplateFromRepositories').resolve({
            errors: [
                {
                    errorMessage: 'The specified repository does not exist.',
                    errorCode: 'RepositoryDoesNotExistException',
                },
            ],
        });
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Failed, errorCode: exceptions.InternalFailure.name });
        expect(mockDelete.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful - code commit repository association', async () => {
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject({
            ...request.desiredResourceState,
            RepositoryNames: ['repo1', 'repo2'],
        });
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
