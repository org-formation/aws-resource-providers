import { Action, exceptions, OperationStatus, UnmodeledRequest } from 'cfn-rpdk';
import createFixture from '../sam-tests/create.json';
import deleteFixture from '../sam-tests/delete.json';
import listFixture from '../sam-tests/list.json';
import readFixture from '../sam-tests/read.json';
import updateFixture from '../sam-tests/update.json';
import { CallbackContext, resource, Resource } from '../src/handlers';
import { ResourceModel } from '../src/models';

describe('when calling handler', () => {
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
        fixtureMap.set(Action.List, listFixture);
    });

    test('parse valid duration', () => {
        [
            ['PT0S', 0],
            ['PT0020M', 1200],
            ['PT12H', 43200],
            ['PT02H40M36S', 9636],
        ].forEach((item: [string, number]) => {
            const duration = item[0];
            const seconds = Resource['parseDuration'](duration);
            expect(seconds).toBe(item[1]);
        });
    });

    test('parse invalid duration', () => {
        [null, '', 'PT000', '-PT10S', 'P1Y2M3W4DT5H6M7S', 'PT12H1S', 'PT23H58M22S'].forEach((duration: string) => {
            const parseDuration = () => {
                Resource['parseDuration'](duration);
            };
            expect(parseDuration).toThrow(exceptions.InvalidRequest);
        });
    });

    test('create operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(createFixture).toModeled<ResourceModel>(resource['modelCls']);
        const callbackContext: CallbackContext = {
            Remaining: null,
        };
        const progress = await resource['invokeHandler'](null, request, Action.Create, callbackContext);
        expect(progress).toMatchObject({
            status: OperationStatus.InProgress,
            message: '',
            callbackContext: {
                Remaining: -540,
            },
            callbackDelaySeconds: Resource.DEFAULT_DURATION,
            resourceModel: request.desiredResourceState,
        });
    });

    test('update operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(updateFixture).toModeled<ResourceModel>(resource['modelCls']);
        const callbackContext: CallbackContext = {
            Remaining: 700,
        };
        const progress = await resource['invokeHandler'](null, request, Action.Update, callbackContext);
        expect(progress).toMatchObject({
            status: OperationStatus.InProgress,
            message: '',
            callbackContext: {
                Remaining: 100,
            },
            callbackDelaySeconds: 600,
            resourceModel: request.desiredResourceState,
        });
    });

    test('delete operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(deleteFixture).toModeled<ResourceModel>(resource['modelCls']);
        const callbackContext: CallbackContext = {
            Remaining: 0,
        };
        const progress = await resource['invokeHandler'](null, request, Action.Delete, callbackContext);
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
    });

    test('read operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(readFixture).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](null, request, Action.Read, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('list operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(listFixture).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](null, request, Action.List, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModels: [request.desiredResourceState],
        });
    });

    test('all operations successful without session', async () => {
        const promises: any[] = [];
        fixtureMap.forEach((fixture: Record<string, any>, action: Action) => {
            const request = UnmodeledRequest.fromUnmodeled(fixture).toModeled<ResourceModel>(resource['modelCls']);
            expect(request).toBeDefined();
            promises.push(resource['invokeHandler'](null, request, action, {}));
        });
        expect.assertions(promises.length);
        await Promise.all(promises);
    });
});
