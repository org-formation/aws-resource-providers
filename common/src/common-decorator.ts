import { Action, BaseModel, BaseResource, Constructor, exceptions, Logger, OperationStatus, Optional, ProgressEvent, ResourceHandlerRequest, SessionProxy } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import Aws from 'aws-sdk/clients/all';

type ClientMap = typeof Aws;
type ServiceName = keyof ClientMap;
type Client = InstanceType<ClientMap[ServiceName]>;
type HandlerEvents = Map<Action, string | symbol>;

export type HandlerArgs<R extends BaseModel, T extends Record<string, any> = Record<string, any>> = {
    session: Optional<SessionProxy>;
    request: ResourceHandlerRequest<R>;
    callbackContext: T;
    logger?: Logger;
};

export interface commonAwsOptions {
    /**
     * @deprecated since version 0.3.0
     */
    serviceName?: ServiceName;
    service?: Constructor<Client>;
    action?: Action;
    debug?: boolean;
}

interface Session {
    client: (...args: any[]) => Client;
}

/**
 * Decorator for event handler with common behavior to interact with AWS APIs.
 *
 * @returns {MethodDecorator}
 */
export function commonAws<T extends Record<string, any>, R extends BaseModel>(options: commonAwsOptions): MethodDecorator {
    return function (target: BaseResource<R>, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor {
        const { debug, service, serviceName } = options;

        if (!descriptor) {
            descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        }

        const originalMethod = descriptor.value;

        function retrieveClient(session: SessionProxy | Session, service: Constructor<Client> | string): any {
            let errorMessage = '';
            if (session && (session instanceof SessionProxy || typeof session.client === 'function')) {
                try {
                    const client = session.client(service);
                    if (client) {
                        return client;
                    }
                } catch (err) {
                    errorMessage = err.message;
                }
            }
            throw new exceptions.InvalidCredentials(`no aws session found - did you forget to register the execution role?\n${errorMessage}`);
        }

        // Wrapping the original method with new signature.
        descriptor.value = async function (session: Optional<SessionProxy | Session>, request: ResourceHandlerRequest<R>, callbackContext: T, logger?: Logger): Promise<ProgressEvent<R, T>> {
            let action = options.action;
            if (!action) {
                const events: HandlerEvents = Reflect.getMetadata('handlerEvents', target);
                events.forEach((value: string | symbol, key: Action) => {
                    if (value === propertyKey) {
                        action = key;
                    }
                });
            }

            logger = logger || console;

            const handlerArgs = { session, request, callbackContext, logger };
            const desiredResourceState = request.desiredResourceState || {};

            let ModelClass: Constructor<R> = Object.getPrototypeOf(desiredResourceState).constructor;
            if ('modelTypeReference' in this) {
                ModelClass = this['modelTypeReference'] || ModelClass;
            }

            const model: R = new ModelClass(desiredResourceState);
            const progress = ProgressEvent.progress<ProgressEvent<R, T>>(model);

            if (debug) logger.log({ action, request, callbackContext });

            const client: Client = retrieveClient(session, service || serviceName);

            if (debug) logger.log({ action, message: 'before perform common task' });
            const modified = await originalMethod.apply(this, [action, handlerArgs, client, model]);
            if (debug) logger.log({ action, message: 'after perform common task' });

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
        };
        return descriptor;
    };
}
