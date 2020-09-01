import { IAM } from 'aws-sdk';
import uuid from 'uuid';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { exceptions, OperationStatus, SessionProxy, UnmodeledRequest } from 'cfn-rpdk';
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

    beforeAll(() => {
        session = new SessionProxy({});
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
        const request = UnmodeledRequest.fromUnmodeled(createFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.create(session, request, {});
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
        const mockGet = iam.mock('getAccountPasswordPolicy').reject({
            ...new Error(),
            code: 'ServiceUnavailableException',
        });
        const spyRetrieve = jest.spyOn<any, any>(resource, 'retrievePasswordPolicy');
        const request = UnmodeledRequest.fromUnmodeled(createFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.create(session, request, {});
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveReturnedWith(
            Promise.reject(exceptions.ServiceInternalError)
        );
        expect(progress.serialize()).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState.serialize(),
        });
    });

    test('create operation fail with contain identifier', async () => {
        const request = UnmodeledRequest.fromUnmodeled(createFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        request.desiredResourceState.resourceId = IDENTIFIER;
        await expect(resource.create(session, request, {})).rejects.toThrow(
            exceptions.InvalidRequest
        );
    });

    test('update operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(updateFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.update(session, request, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('update operation fail not found', async () => {
        const request = UnmodeledRequest.fromUnmodeled(updateFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        request.desiredResourceState.resourceId = undefined;
        await expect(resource.update(session, request, {})).rejects.toThrow(
            exceptions.NotFound
        );
    });

    test('update operation fail not updatable', async () => {
        const request = UnmodeledRequest.fromUnmodeled(updateFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        request.previousResourceState.resourceId = undefined;
        await expect(resource.update(session, request, {})).rejects.toThrow(
            exceptions.NotUpdatable
        );
    });

    test('delete operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(deleteFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.delete(session, request, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
        expect(progress.resourceModel).toBeUndefined();
    });

    test('delete operation fail not found', async () => {
        const mockGet = iam.mock('getAccountPasswordPolicy').reject({
            ...new Error(),
            code: 'NoSuchEntity',
        });
        const spyRetrieve = jest.spyOn<any, any>(resource, 'retrievePasswordPolicy');
        const request = UnmodeledRequest.fromUnmodeled(deleteFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        await expect(resource.delete(session, request, {})).rejects.toThrow(
            exceptions.NotFound
        );
        expect(mockGet.mock).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveBeenCalledTimes(1);
        expect(spyRetrieve).toHaveReturnedWith(Promise.reject(exceptions.NotFound));
    });

    test('delete operation fail generic', async () => {
        const mockDelete = iam.mock('deleteAccountPasswordPolicy').reject({
            ...new Error(),
            code: 'ServiceUnavailableException',
        });
        const request = UnmodeledRequest.fromUnmodeled(deleteFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        await expect(resource.delete(session, request, {})).rejects.toThrow(
            exceptions.InternalFailure
        );
        expect(mockDelete.mock).toHaveBeenCalledTimes(1);
    });

    test('read operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(readFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.read(session, request, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('list operation successful', async () => {
        const request = UnmodeledRequest.fromUnmodeled(listFixture).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.list(session, request, {});
        expect(iam.instance.getAccountPasswordPolicy).toHaveBeenCalledTimes(1);
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModels: [request.desiredResourceState],
        });
    });
});
