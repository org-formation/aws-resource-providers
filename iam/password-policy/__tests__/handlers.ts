import { IAM } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import {
    exceptions,
    OperationStatus,
    ResourceHandlerRequest,
    SessionProxy,
    UnmodeledRequest,
} from 'cfn-rpdk';
import createOperation from '../sam-tests/create.json';
import deleteOperation from '../sam-tests/delete.json';
import listOperation from '../sam-tests/list.json';
import readOperation from '../sam-tests/read.json';
import updateOperation from '../sam-tests/update.json';
import { resource, Resource } from '../src/handlers';
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
        iam = on(IAM);
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

    test('create operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(createOperation).toModeled<
            ResourceModel
        >(resource['modelCls']);
        const progress = await resource.create(session, request, {});
        const model = request.desiredResourceState;
        model.resourceId = IDENTIFIER;
        expect(progress.serialize()).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: model.serialize(),
        });
    });

    test('update operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(updateOperation).toModeled<
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

    test('delete operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(deleteOperation).toModeled<
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

    test('read operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(readOperation).toModeled<
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

    test('list operation', async () => {
        const request = UnmodeledRequest.fromUnmodeled(listOperation).toModeled<
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
