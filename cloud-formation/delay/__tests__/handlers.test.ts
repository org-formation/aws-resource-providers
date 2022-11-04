import { Action, exceptions, OperationStatus } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import createFixture from './data/create-success.json';
import deleteFixture from './data/delete-success.json';
import readFixture from './data/read-success.json';
import updateFixture from './data/update-success.json';
import { CallbackContext, resource, Resource } from '../src/handlers';

describe('when calling handler', () => {
    let testEntrypointPayload: any;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(() => {
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

    test('parse valid duration - cloudformation delay', () => {
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

    test('parse invalid duration - cloudformation delay', () => {
        [null, '', 'PT000', '-PT10S', 'P1Y2M3W4DT5H6M7S', 'PT12H1S', 'PT23H58M22S'].forEach((duration: string) => {
            const parseDuration = () => {
                Resource['parseDuration'](duration);
            };
            expect(parseDuration).toThrow(exceptions.InvalidRequest);
        });
    });

    test('create success - cloudformation delay', async () => {
        const callbackContext: CallbackContext = { Remaining: null };
        const request = fixtureMap.get(Action.Create);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, callbackContext, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.InProgress, message: '', callbackContext: { Remaining: -540 }, callbackDelaySeconds: Resource.DEFAULT_DURATION });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('update success - cloudformation delay', async () => {
        const callbackContext: CallbackContext = { Remaining: 700 };
        const request = fixtureMap.get(Action.Update);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, callbackContext, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.InProgress, message: '', callbackContext: { Remaining: 100 }, callbackDelaySeconds: 600 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('delete success - cloudformation delay', async () => {
        const callbackContext: CallbackContext = { Remaining: 0 };
        const request = fixtureMap.get(Action.Delete);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Delete, callbackContext, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeNull();
    });

    test('read success - cloudformation delay', async () => {
        const request = fixtureMap.get(Action.Read);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Read, request }, null);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject(request.desiredResourceState);
    });

    test('all operations successful without session - cloudformation delay', async () => {
        expect.assertions(fixtureMap.size);
        for (const [action, request] of fixtureMap) {
            const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action, request }, null);
            expect(progress.status).toBeDefined();
        }
    });
});
