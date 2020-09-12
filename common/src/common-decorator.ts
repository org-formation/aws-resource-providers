import { Action, BaseModel, BaseResource, exceptions, OperationStatus, Optional, ProgressEvent, ResourceHandlerRequest, SessionProxy } from 'cfn-rpdk';
import * as Aws from 'aws-sdk/clients/all';

type ClientMap = typeof Aws;
type ServiceName = keyof ClientMap;
type Client = InstanceType<ClientMap[ServiceName]>;
type HandlerEvents = Map<Action, string | symbol>;

export type HandlerArgs<R extends BaseModel, T extends Record<string, any> = Record<string, any>> = {
    session: Optional<SessionProxy>;
    request: ResourceHandlerRequest<R>;
    callbackContext: T;
};

export interface commonAwsOptions {
    serviceName: ServiceName;
    action?: Action;
    debug?: boolean;
}

interface Session {
    client: (...args: any[]) => Client;
}

/**
 * Decorator for event handler with common behavior
 * to interact with AWS APIs.
 *
 * @returns {MethodDecorator}
 */
export function commonAws<T extends Record<string, any>, ResourceModel extends BaseModel>(options: commonAwsOptions): MethodDecorator {
    return function (target: BaseResource<ResourceModel>, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
        const { debug, serviceName } = options;

        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }

        const originalMethod = descriptor.value;

        // Wrapping the original method with new signature.
        descriptor.value = async function (session: Optional<SessionProxy | Session>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: T): Promise<ProgressEvent> {
            let action = options.action;
            if (!action) {
                const events: HandlerEvents = Reflect.getMetadata('handlerEvents', target);
                events.forEach((value: string | symbol, key: Action) => {
                    if (value === propertyKey) {
                        action = key;
                    }
                });
            }

            const handlerArgs = { session, request, callbackContext };

            const model: ResourceModel = request.desiredResourceState;
            const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, T>>(model);

            if (debug) console.info({ action, request, callbackContext, env: process.env });

            if (session && (session instanceof SessionProxy || session.client instanceof Function)) {
                const service = session.client(serviceName as any);

                if (debug) console.info({ action, message: 'before perform' });
                const modified = await originalMethod.apply(this, [action, handlerArgs, service]);
                if (debug) console.info({ action, message: 'after perform' });

                if (modified !== undefined) {
                    if (Array.isArray(modified)) {
                        progress.resourceModel = null;
                        progress.resourceModels = modified;
                    } else {
                        progress.resourceModel = modified;
                        progress.resourceModels = null;
                    }
                }

                progress.status = OperationStatus.Success;
                return Promise.resolve(progress);
            } else {
                throw new exceptions.InvalidCredentials('no aws session found - did you forget to register the execution role?');
            }
        };
        return descriptor;
    };
}
