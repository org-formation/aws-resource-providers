import { S3Control } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, OperationStatus, SessionProxy, UnmodeledRequest } from 'cfn-rpdk';
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
    let s3control: AwsServiceMockBuilder<S3Control>;
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
        s3control = on(S3Control, { snapshot: false });
        s3control.mock('getPublicAccessBlock').resolve({
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: true,
            },
        });
        s3control.mock('putPublicAccessBlock').resolve({});
        s3control.mock('deletePublicAccessBlock').resolve({});
        session['client'] = () => s3control.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('create operation successful - s3 public access block', async () => {
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Create)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.Create, {});
        const model = request.desiredResourceState.serialize();
        model.ResourceId = IDENTIFIER;
        expect(progress.serialize()).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: model,
        });
    });

    test('update operation successful - s3 public access block', async () => {
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Update)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.Update, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('delete operation successful - s3 public access block', async () => {
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Delete)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.Delete, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
        });
        expect(progress.resourceModel).toBeNull();
    });

    test('read operation successful - s3 public access block', async () => {
        const request = UnmodeledRequest.fromUnmodeled(fixtureMap.get(Action.Read)).toModeled<ResourceModel>(resource['modelCls']);
        const progress = await resource['invokeHandler'](session, request, Action.Read, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: request.desiredResourceState,
        });
    });

    test('all operations fail without session - s3 public access block', async () => {
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
