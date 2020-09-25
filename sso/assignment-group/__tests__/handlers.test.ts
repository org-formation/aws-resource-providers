
import SSOAdmin = require('../ssoadmin/ssoadmin');
import { on, AwsServiceMockBuilder, AwsFunctionMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, OperationStatus, SessionProxy, UnmodeledRequest } from 'cfn-rpdk';
import createFixture from '../sam-tests/create.json';
import deleteFixture from '../sam-tests/delete.json';
import readFixture from '../sam-tests/read.json';
import updateFixture from '../sam-tests/update.json';
import { resource } from '../src/handlers';
import { ResourceModel } from '../src/models';

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let session: SessionProxy;
    let ssoAdmin: AwsServiceMockBuilder<SSOAdmin>;
    let createAccountAssignmentMock: AwsFunctionMockBuilder<SSOAdmin>;
    let deleteAccountAssignmentMock: AwsFunctionMockBuilder<SSOAdmin>;
    let describeAccountAssignmentDeletionStatusMock: AwsFunctionMockBuilder<SSOAdmin>;
    let describeAccountAssignmentCreationStatusMock: AwsFunctionMockBuilder<SSOAdmin>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        session = new SessionProxy({});
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Update, updateFixture);
    });

    beforeEach(async () => {
        ssoAdmin = on(SSOAdmin, { snapshot: false });
        // createAccountAssignmentMock = ssoAdmin.mock('createAccountAssignment').resolve({AccountAssignmentCreationStatus: { RequestId: 'abcdef', Status : 'IN_PROGRESS' }});
        // deleteAccountAssignmentMock = ssoAdmin.mock('deleteAccountAssignment').resolve({AccountAssignmentDeletionStatus: { RequestId: 'abcdef', Status : 'IN_PROGRESS' }});
        // describeAccountAssignmentDeletionStatusMock = ssoAdmin.mock('describeAccountAssignmentDeletionStatus').resolve({AccountAssignmentDeletionStatus: { RequestId: 'abcdef', Status : 'SUCCESS' }});
        // describeAccountAssignmentCreationStatusMock = ssoAdmin.mock('describeAccountAssignmentCreationStatus').resolve({AccountAssignmentCreationStatus: { RequestId: 'abcdef', Status : 'SUCCESS' }});
        const fn = () => ssoAdmin.instance as any; //aws-sdk version issue....
        session['client'] = fn;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('principal assignments all operations fail without session', async () => {
        const promises: any[] = [];
        fixtureMap.forEach((fixture: Record<string, any>, action: Action) => {
            const request = UnmodeledRequest.fromUnmodeled(fixture).toModeled<ResourceModel>(resource['modelCls']);
            promises.push(
                resource['invokeHandler'](null, request, action, {}).catch((e: exceptions.BaseHandlerException) => {
                    expect(e).toEqual(expect.any(exceptions.InvalidCredentials));
                })
            );
        });
        expect.assertions(promises.length);
        await Promise.all(promises);
    });


    test('create will create account assignment for each principal x target', async () => {
        const request = UnmodeledRequest.fromUnmodeled(
            fixtureMap.get(Action.Create)
        ).toModeled<ResourceModel>(resource['modelCls']);

        const progress = await resource['invokeHandler'](
            session,
            request,
            Action.Create,
            {}
        );
        
        expect(progress.status).toBe(OperationStatus.Success);
        expect(progress.resourceModel).toBeDefined();

        expect(createAccountAssignmentMock.mock).toHaveBeenCalledTimes(6);
        expect(deleteAccountAssignmentMock.mock).toHaveBeenCalledTimes(0);
        
        const resourceModel: ResourceModel = progress.resourceModel;
        expect(resourceModel.resourceId).toContain('arn:community::123456789012:principal-assignments:GROUP:d7fefe8f-992c-4524-bd52-cd54164c1e96')

    });

    test('update will create and remove account assignment for each principal x target', async () => {
        const request = UnmodeledRequest.fromUnmodeled(
            fixtureMap.get(Action.Update)
        ).toModeled<ResourceModel>(resource['modelCls']);

        const progress = await resource['invokeHandler'](
            session,
            request,
            Action.Update,
            {}
        );
        
        expect(progress.status).toBe(OperationStatus.Success);
        expect(progress.resourceModel).toBeDefined();

        expect(createAccountAssignmentMock.mock).toHaveBeenCalledTimes(4);
        expect(deleteAccountAssignmentMock.mock).toHaveBeenCalledTimes(4);
    });
});
