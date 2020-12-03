import * as Aws from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, BaseModel, BaseResource, BaseResourceHandlerRequest, exceptions, handlerEvent, OperationStatus, SessionProxy } from 'cfn-rpdk';
import { Exclude, Expose } from 'class-transformer';
import { commonAws, HandlerArgs } from '../src/common-decorator';

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let testEntrypointPayload: any;
    let spySession: jest.SpyInstance;
    let spySessionClient: jest.SpyInstance;
    let iam: AwsServiceMockBuilder<Aws.IAM>;
    let resource: Resource;

    class MockModel extends BaseModel {
        ['constructor']: typeof MockModel;
        @Exclude()
        public static readonly TYPE_NAME: string = 'Organization::Service::Resource';
        @Expose() id?: string;
    }

    const modelList = [new MockModel({ id: '1' }), new MockModel({ id: '2' })];

    class Resource extends BaseResource {
        @handlerEvent(Action.Create)
        @commonAws({ service: Aws.S3, debug: true })
        public async create(action: Action, args: HandlerArgs<MockModel>, service: Aws.S3, model: MockModel): Promise<MockModel> {
            model.id = 'id';
            return model;
        }
        @handlerEvent(Action.Update)
        @commonAws({ serviceName: 'S3' })
        public async update(action: Action, args: HandlerArgs<MockModel>, service: Aws.S3, model: MockModel): Promise<MockModel> {
            return model;
        }
        @handlerEvent(Action.List)
        @commonAws({ service: Aws.S3 })
        public async list(action: Action, args: HandlerArgs<MockModel>, service: Aws.S3, model: MockModel): Promise<MockModel[]> {
            args.logger.log({ action, model });
            return modelList;
        }
    }

    beforeEach(async () => {
        iam = on(Aws.IAM, { snapshot: false });
        spySession = jest.spyOn(SessionProxy, 'getSession');
        spySessionClient = jest.spyOn<any, any>(SessionProxy.prototype, 'client');
        spySessionClient.mockReturnValue(iam.instance);
        testEntrypointPayload = {
            credentials: { accessKeyId: '', secretAccessKey: '', sessionToken: '' },
            region: 'us-east-1',
            action: 'UPDATE',
            request: {
                clientRequestToken: 'ecba020e-b2e6-4742-a7d0-8a06ae7c4b2b',
                desiredResourceState: { id: 'some-id' },
                previousResourceState: { id: 'some-id' },
                logicalResourceIdentifier: 'MyResource',
            },
        };
        resource = new Resource(MockModel.TYPE_NAME, MockModel);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('method fail without session', async () => {
        spySession.mockReturnValue(null);
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request: {} }, null);
        expect(spySession).toHaveBeenCalledTimes(1);
        expect(progress.errorCode).toBe(exceptions.InvalidCredentials.name);
    });

    test('method success with session proxy', async () => {
        const spyDeserialize: jest.SpyInstance = jest.spyOn(MockModel, 'deserialize');
        const progress = await resource.testEntrypoint(testEntrypointPayload, null);
        expect(spySession).toHaveBeenCalledTimes(1);
        expect(spySessionClient).toHaveBeenCalledTimes(1);
        expect(spySessionClient).toHaveBeenCalledWith('S3');
        expect(spyDeserialize).toHaveBeenCalledTimes(2);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject({ id: 'some-id' });
    });

    test('method success with update and service name', async () => {
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Update, request: {} }, null);
        expect(spySession).toHaveBeenCalledTimes(1);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel).toBeDefined();
    });

    test('method success with list and service constructor', async () => {
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.List, request: {} }, null);
        expect(spySession).toHaveBeenCalledTimes(1);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModels).toMatchObject(modelList);
    });

    test('method success with generic session', async () => {
        spySession.mockReturnValue({
            client: () => iam.instance,
        });
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request: {} }, null);
        expect(spySession).toHaveBeenCalledTimes(1);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(progress.resourceModel.serialize()).toMatchObject({ id: 'id' });
    });

    test('method success with null desired state and no logger', async () => {
        const spyLogger = jest.spyOn<any, any>(console, 'log');
        const spyInvokeHandler = jest.spyOn<any, any>(resource, 'invokeHandler');
        spyInvokeHandler.mockImplementationOnce((session: SessionProxy, request: BaseResourceHandlerRequest<MockModel>, action: Action, callbackContext: any) => {
            resource['loggerProxy'] = null;
            request.desiredResourceState = null;
            return resource['invokeHandler'](session, request, action, callbackContext);
        });
        if (!('modelTypeReference' in resource)) {
            Object.defineProperty(resource, 'modelTypeReference', { value: null });
        }
        const progress = await resource.testEntrypoint({ ...testEntrypointPayload, action: Action.Create, request: {} }, null);
        expect(spySession).toHaveBeenCalledTimes(1);
        expect(spyLogger).toHaveBeenCalled();
        expect(spyInvokeHandler).toHaveBeenCalledTimes(2);
        expect(progress).toMatchObject({ status: OperationStatus.Success, message: '', callbackDelaySeconds: 0 });
        expect(JSON.stringify(progress.resourceModel)).toBe('{"id":"id"}');
    });

    test('decorator return even without descriptor', async () => {
        const symbolProperty = Symbol.for('baz');
        const obj = { [symbolProperty]: 73 };
        const originalDescriptor = Object.getOwnPropertyDescriptor(obj, symbolProperty);
        const methodDecorator = commonAws({ serviceName: 'S3' });
        const modifiedDescriptor = methodDecorator(obj, symbolProperty, null) as PropertyDescriptor;
        expect(modifiedDescriptor.value).not.toBe(originalDescriptor.value);
        expect(modifiedDescriptor.value).toBeInstanceOf(Function);
    });
});
