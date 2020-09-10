import { CodeCommit } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import {
    Action,
    exceptions,
    OperationStatus,
    SessionProxy,
    UnmodeledRequest,
} from 'cfn-rpdk';
import createFixture from '../sam-tests/create.json';
import deleteFixture from '../sam-tests/delete.json';
import readFixture from '../sam-tests/read.json';
import updateFixture from '../sam-tests/update.json';
import { resource } from '../src/handlers';
import { ResourceModel } from '../src/models';

const IDENTIFIER = '123456789012';

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let session: SessionProxy;
    let codecommit: AwsServiceMockBuilder<CodeCommit>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        session = new SessionProxy({});
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        codecommit = on(CodeCommit, { snapshot: false });
        codecommit.mock('getApprovalRuleTemplate').resolve({
            approvalRuleTemplate: {
                approvalRuleTemplateName: 'test',
            },
        });
        codecommit.mock('createApprovalRuleTemplate').resolve({
            approvalRuleTemplate: {
                approvalRuleTemplateName: 'test',
                approvalRuleTemplateId: IDENTIFIER,
            },
        });
        codecommit.mock('deleteApprovalRuleTemplate').resolve({});
        session['client'] = () => codecommit.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test.only('create operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(
            fixtureMap.get(Action.Create)
        ).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](
            session,
            request,
            Action.Create,
            {}
        );
        const model = request.desiredResourceState;
        model.approvalRuleTemplateId = IDENTIFIER;
        expect(progress.serialize()).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: model.serialize(),
        });
    });

    test('update operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(
            fixtureMap.get(Action.Update)
        ).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](
            session,
            request,
            Action.Update,
            {}
        );
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('delete operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(
            fixtureMap.get(Action.Delete)
        ).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](
            session,
            request,
            Action.Delete,
            {}
        );
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
        expect(progress.resourceModel).toBeNull();
    });

    test('read operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(
            fixtureMap.get(Action.Read)
        ).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](
            session,
            request,
            Action.Read,
            {}
        );
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('all operations fail without session', async () => {
        const promises: any[] = [];
        fixtureMap.forEach((fixture: Record<string, any>, action: Action) => {
            const request = UnmodeledRequest.fromUnmodeled(fixture).toModeled<
                ResourceModel
            >(resource['modelCls']);
            promises.push(
                resource['invokeHandler'](null, request, action, {}).catch(
                    (e: exceptions.BaseHandlerException) => {
                        expect(e).toEqual(expect.any(exceptions.InvalidCredentials));
                    }
                )
            );
        });
        expect.assertions(promises.length);
        await Promise.all(promises);
    });
});
