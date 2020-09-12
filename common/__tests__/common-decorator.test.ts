import * as Aws from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, BaseModel, BaseResource, BaseResourceHandlerRequest, exceptions, handlerEvent, OperationStatus, SessionProxy } from 'cfn-rpdk';
import { commonAws } from '../src/common-decorator';

jest.mock('aws-sdk');

class Model extends BaseModel {}

class Resource extends BaseResource {
    @handlerEvent(Action.Create)
    @commonAws({
        serviceName: 'S3Control',
        debug: true,
    })
    public async create(): Promise<Model> {
        const model = new Model();
        return model;
    }
}

describe('when calling handler', () => {
    let session: SessionProxy;
    let iam: AwsServiceMockBuilder<Aws.IAM>;
    let resource: Resource;

    beforeAll(() => {
        session = new SessionProxy({});
    });

    beforeEach(async () => {
        iam = on(Aws.IAM, { snapshot: false });
        session['client'] = () => iam.instance;
        resource = new Resource('', Model);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('method fail without session', async () => {
        const request = new BaseResourceHandlerRequest<Model>();
        expect.assertions(1);
        try {
            await resource['invokeHandler'](null, request, Action.Create, {});
        } catch (e) {
            expect(e).toEqual(expect.any(exceptions.InvalidCredentials));
        }
    });

    test('method success with session proxy', async () => {
        const request = new BaseResourceHandlerRequest<Model>();
        const progress = await resource['invokeHandler'](session, request, Action.Create, {});
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: {},
        });
    });

    test('method success with generic session', async () => {
        const request = new BaseResourceHandlerRequest<Model>();
        const progress = await resource['invokeHandler'](
            {
                client: session.client,
            },
            request,
            Action.Create,
            {}
        );
        expect(progress).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: {},
        });
    });
});
