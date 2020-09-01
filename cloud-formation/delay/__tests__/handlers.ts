import { exceptions, OperationStatus, UnmodeledRequest } from 'cfn-rpdk';
import createOperation from '../sam-tests/create.json';
import deleteOperation from '../sam-tests/delete.json';
import listOperation from '../sam-tests/list.json';
import readOperation from '../sam-tests/read.json';
import updateOperation from '../sam-tests/update.json';
import { CallbackContext, resource, Resource } from '../src/handlers';
import { ResourceModel } from '../src/models';

describe('when calling handler', () => {
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
        [
            null,
            '',
            'PT000',
            '-PT10S',
            'P1Y2M3W4DT5H6M7S',
            'PT12H1S',
            'PT23H58M22S',
        ].forEach((duration: string) => {
            const parseDuration = () => {
                Resource['parseDuration'](duration);
            };
            expect(parseDuration).toThrow(exceptions.InvalidRequest);
        });
    });

    test('create operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(createOperation).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const callbackContext: CallbackContext = {
            Remaining: null,
        };
        const progress = await resource.create(null, request, callbackContext);
        expect(progress).toMatchObject({
            status: OperationStatus.InProgress,
            message: '',
            callbackContext: {
                Remaining: -590,
            },
            callbackDelaySeconds: 10,
            resourceModel: request.desiredResourceState,
        });
    });

    test('update operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(updateOperation).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const callbackContext: CallbackContext = {
            Remaining: 700,
        };
        const progress = await resource.update(null, request, callbackContext);
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
        const request = UnmodeledRequest.fromUnmodeled(deleteOperation).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const callbackContext: CallbackContext = {
            Remaining: 0,
        };
        const progress = await resource.delete(null, request, callbackContext);
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
    });

    test('read operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(readOperation).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.read(null, request, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('list operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(listOperation).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.list(null, request, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModels: [request.desiredResourceState],
        });
    });
});
