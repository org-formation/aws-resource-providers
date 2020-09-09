import { ServiceQuotas } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import {
    Action,
    exceptions,
    SessionProxy,
    UnmodeledRequest,
    OperationStatus,
} from 'cfn-rpdk';
import createFixture from '../sam-tests/create.json';
import updateDecreaseBucketsFixture from '../sam-tests/update-decrease-buckets.json';
import updateFixture from '../sam-tests/update.json';
import { resource } from '../src/handlers';
import { ResourceModel } from '../src/models';

jest.mock('aws-sdk');

const IDENTIFIER = '123456789012';

describe('when calling handler', () => {
    let session: SessionProxy;
    let serviceQuotas: AwsServiceMockBuilder<ServiceQuotas>;
    let listRequestedServiceQuotaChangeHistoryByQuotaMock: any;
    let getServiceQuotaMock: any;
    let requestServiceQuotaIncreaseMock: any;
    let fixtureMap: Map<Action, Record<string, any>>;

    beforeAll(() => {
        session = new SessionProxy({});
        fixtureMap = new Map<Action, Record<string, any>>();
        fixtureMap.set(Action.Create, createFixture);
        //fixtureMap.set(Action.Read, readFixture);
        fixtureMap.set(Action.Update, updateFixture);
        //fixtureMap.set(Action.Delete, deleteFixture);
    });

    beforeEach(async () => {
        serviceQuotas = on(ServiceQuotas, { snapshot: false });
        listRequestedServiceQuotaChangeHistoryByQuotaMock = serviceQuotas
            .mock('listRequestedServiceQuotaChangeHistoryByQuota')
            .resolve({});
        getServiceQuotaMock = serviceQuotas.mock('getServiceQuota').resolve({});
        requestServiceQuotaIncreaseMock = serviceQuotas
            .mock('requestServiceQuotaIncrease')
            .resolve({});
        session['client'] = () => serviceQuotas.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
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

    test('service quotas s3 create operation successful', async () => {
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
        model.resourceId = IDENTIFIER;
        expect(progress.serialize()).toMatchObject({
            status: OperationStatus.Success,
            message: '',
            callbackDelaySeconds: 0,
            resourceModel: model.serialize(),
        });

        expect(listRequestedServiceQuotaChangeHistoryByQuotaMock.mock).toBeCalledTimes(
            1
        );
        expect(
            listRequestedServiceQuotaChangeHistoryByQuotaMock.mock
        ).toHaveBeenCalledWith({ QuotaCode: 'L-DC2B2D3D', ServiceCode: 's3' });
        expect(getServiceQuotaMock.mock).toBeCalledTimes(1);
        expect(getServiceQuotaMock.mock).toHaveBeenCalledWith({
            QuotaCode: 'L-DC2B2D3D',
            ServiceCode: 's3',
        });
        expect(requestServiceQuotaIncreaseMock.mock).toBeCalledTimes(1);
        expect(requestServiceQuotaIncreaseMock.mock).toHaveBeenCalledWith({
            QuotaCode: 'L-DC2B2D3D',
            ServiceCode: 's3',
            DesiredValue: 100,
        });
    });

    test('service quotas s3 update operation successful', async () => {
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

        expect(listRequestedServiceQuotaChangeHistoryByQuotaMock.mock).toBeCalledTimes(
            1
        );
        expect(
            listRequestedServiceQuotaChangeHistoryByQuotaMock.mock
        ).toHaveBeenCalledWith({ QuotaCode: 'L-DC2B2D3D', ServiceCode: 's3' });
        expect(getServiceQuotaMock.mock).toBeCalledTimes(1);
        expect(getServiceQuotaMock.mock).toHaveBeenCalledWith({
            QuotaCode: 'L-DC2B2D3D',
            ServiceCode: 's3',
        });
        expect(requestServiceQuotaIncreaseMock.mock).toBeCalledTimes(1);
        expect(requestServiceQuotaIncreaseMock.mock).toHaveBeenCalledWith({
            QuotaCode: 'L-DC2B2D3D',
            ServiceCode: 's3',
            DesiredValue: 110,
        });
    });

    test('service quotas s3 update decrease bucket limit fails', async () => {
        const updateDecreaseBuckets = updateDecreaseBucketsFixture;
        const request = UnmodeledRequest.fromUnmodeled(updateDecreaseBuckets).toModeled<
            ResourceModel
        >(resource['modelCls']);

        expect(async () => {
            await resource['invokeHandler'](session, request, Action.Update, {});
        }).rejects.toThrowError(
            /Decrease of limit failed because desired value 90 is lower than previous value 100/
        );

        expect(listRequestedServiceQuotaChangeHistoryByQuotaMock.mock).toBeCalledTimes(
            0
        );
        expect(getServiceQuotaMock.mock).toBeCalledTimes(0);
        expect(requestServiceQuotaIncreaseMock.mock).toBeCalledTimes(0);
    });
});
