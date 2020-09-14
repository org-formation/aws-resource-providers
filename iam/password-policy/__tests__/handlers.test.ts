import { IAM } from 'aws-sdk';
import uuid from 'uuid';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, OperationStatus, SessionProxy, UnmodeledRequest } from 'cfn-rpdk';
import createFixture from '../sam-tests/create.json';
import deleteFixture from '../sam-tests/delete.json';
import listFixture from '../sam-tests/list.json';
import readFixture from '../sam-tests/read.json';
import updateFixture from '../sam-tests/update.json';
import { resource } from '../src/handlers';
import { ResourceModel } from '../src/models';

const IDENTIFIER = 'f3390613-b2b5-4c31-a4c6-66813dff96a6';

jest.mock('aws-sdk');
jest.mock('uuid', () => {
    return {
        v4: () => IDENTIFIER,
    };
});

describe('when calling handler', () => {
    let session: SessionProxy;
    let iam: AwsServiceMockBuilder<IAM>;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        session = new SessionProxy({});
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
        fixtureMap.set(Action.List, listFixture);
    });

    beforeEach(async () => {
        iam = on(IAM, { snapshot: false });
        iam.mock('getAccountPasswordPolicy').resolve({
            PasswordPolicy: {
                MinimumPasswordLength: 6,
            },
        });
        iam.mock('updateAccountPasswordPolicy').resolve({});
        iam.mock('deleteAccountPasswordPolicy').resolve({});
        session['client'] = () => iam.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('create operation successful', async () => {
        const spyUuid = jest.spyOn(uuid, 'v4');
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Create)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.Create, {});
        const model = request.desiredResourceState;
        model.resourceId = IDENTIFIER;
        expect(spyUuid).toHaveBeenCalledTimes(1);
        expect(progress.serialize()).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: model.serialize(),
        });
    });

    test('create operation fail generic', async () => {
        expect.assertions(7);
        const mockGet = iam.mock('getAccountPasswordPolicy').reject({
            ...new Error(),
            code: 'ServiceUnavailableException',
        });
        const mockUpdate = iam.mock('updateAccountPasswordPolicy').reject({
            ...new Error(),
            code: 'ServiceUnavailableException',
        });
        const spyRetrieve = jest.spyOn<any, any>(resource, 'retrievePasswordPolicy');
        const spyUpsert = jest.spyOn<any, any>(resource, 'upsertPasswordPolicy');
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Create)).toModeled<ResourceModel>(resource['modelCls']);
        try {
            await resource['invokeHandler'](session, request, Action.Create, {});
        } catch (e) {
            expect(e).toMatchObject({ code: 'ServiceUnavailableException' });
        }
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveReturned();
        expect(mockUpdate.mock).toHaveBeenCalledTimes(1);
        expect(spyUpsert).toHaveBeenCalledTimes(1);
        expect(spyUpsert).toHaveReturned();
    });

    test('create operation fail with contain identifier', async () => {
        expect.assertions(1);
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Create)).toModeled<ResourceModel>(resource['modelCls']);
        request.desiredResourceState.resourceId = IDENTIFIER;
        try {
            await resource['invokeHandler'](session, request, Action.Create, {});
        } catch (e) {
            expect(e).toEqual(expect.any(exceptions.InvalidRequest));
        }
    });

    test('update operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Update)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.Update, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('update operation fail not found', async () => {
        expect.assertions(1);
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Update)).toModeled<ResourceModel>(resource['modelCls']);
        request.desiredResourceState.resourceId = undefined;
        try {
            await resource['invokeHandler'](session, request, Action.Update, {});
        } catch (e) {
            expect(e).toEqual(expect.any(exceptions.NotFound));
        }
    });

    test('update operation fail not updatable', async () => {
        expect.assertions(1);
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Update)).toModeled<ResourceModel>(resource['modelCls']);
        request.previousResourceState.resourceId = undefined;
        try {
            await resource['invokeHandler'](session, request, Action.Update, {});
        } catch (e) {
            expect(e).toEqual(expect.any(exceptions.NotUpdatable));
        }
    });

    test('delete operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Delete)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.Delete, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
        expect(progress.resourceModel).toBeNull();
    });

    test('delete operation fail not found', async () => {
        expect.assertions(4);
        const mockGet = iam.mock('getAccountPasswordPolicy').reject({
            ...new Error(),
            code: 'NoSuchEntity',
        });
        const spyRetrieve = jest.spyOn<any, any>(resource, 'retrievePasswordPolicy');
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Delete)).toModeled<ResourceModel>(resource['modelCls']);
        try {
            await resource['invokeHandler'](session, request, Action.Delete, {});
        } catch (e) {
            expect(e).toEqual(expect.any(exceptions.NotFound));
        }
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveReturned();
    });

    test('delete operation fail generic', async () => {
        expect.assertions(2);
        const mockDelete = iam.mock('deleteAccountPasswordPolicy').reject({
            ...new Error(),
            code: 'ServiceUnavailableException',
        });
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Delete)).toModeled<ResourceModel>(resource['modelCls']);
        try {
            await resource['invokeHandler'](session, request, Action.Delete, {});
        } catch (e) {
            expect(e).toMatchObject({ code: 'ServiceUnavailableException' });
        }
        expect(mockDelete.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Read)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.Read, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('list operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.List)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.List, {});
        expect(iam.instance.getAccountPasswordPolicy).toHaveBeenCalledTimes(1);
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModels: [request.desiredResourceState],
        });
    });

    test('all operations fail without session', async () => {
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
});
