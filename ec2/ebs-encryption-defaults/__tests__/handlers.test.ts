import { EC2 } from 'aws-sdk';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';
import { Action, exceptions, SessionProxy, UnmodeledRequest } from 'cfn-rpdk';
import createFixture from '../sam-tests/create.json';
import deleteFixture from '../sam-tests/delete.json';
import readFixture from '../sam-tests/read.json';
import updateFixture from '../sam-tests/update.json';
import { resource } from '../src/handlers';
import { ResourceModel } from '../src/models';

jest.mock('aws-sdk');

describe('when calling handler', () => {
    let session: SessionProxy;
    let ec2: AwsServiceMockBuilder<EC2>;
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
        ec2 = on(EC2, { snapshot: false });
        session['client'] = () => ec2.instance;
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
});
