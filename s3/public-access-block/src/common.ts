import {
    Optional, SessionProxy,
    exceptions, ResourceHandlerRequest, OperationStatus, ProgressEvent,
    Action,
    HandlerSignature,
    BaseResource
} from "cfn-rpdk";
import { ResourceModel } from "./models";
import AWS from "aws-sdk";


type ServiceName = keyof (typeof AWS);

type CallbackContext = Record<string, any>;
export type HandlerArgs = {
    session: Optional<SessionProxy>,
    request: ResourceHandlerRequest<ResourceModel>,
    callbackContext: CallbackContext
}

type HandlerFunc<TService, TResource> = {
    serviceName: ServiceName,
    perform: (action: Action, args: HandlerArgs, service: TService) => Promise<TResource>
}

export type ResourceProviderHandler<TService, TResource> = (action: Action, args: HandlerArgs, service: TService) => Promise<TResource | null>;

export const WrapHandler = <TService, TResource extends ResourceModel>(action: Action, serviceName: ServiceName, perform: ResourceProviderHandler<TService, TResource>): HandlerSignature => {
    return async (session: Optional<SessionProxy>, request: ResourceHandlerRequest<ResourceModel>, callbackContext: CallbackContext): Promise<ProgressEvent> => {
        const handlerArgs = { session, request, callbackContext}
        return await wrapHandlerInternal(action, handlerArgs, { serviceName, perform});
    }
}

const wrapHandlerInternal = async <TService extends any, TResource extends ResourceModel>(action: Action, handlerArgs: HandlerArgs, handlerFunc: HandlerFunc<TService, TResource>): Promise<ProgressEvent> => {
    const { session, request, callbackContext } = handlerArgs;

    const model: ResourceModel = request.desiredResourceState;
    const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);

    console.info({ action, request, callbackContext, env: process.env });

    if (session instanceof SessionProxy) {
        const service = session.client(handlerFunc.serviceName as any) as TService;

        console.info({ action, message: 'before perform' });
        const modified = await handlerFunc.perform(action, handlerArgs, service);
        console.info({ action, message: 'after perform' });

        progress.status = OperationStatus.Success;
        if (modified !== undefined) {
            progress.resourceModel = modified;
            progress.resourceModels = null;
        }

        progress.status = OperationStatus.Success;
        return progress;
    } else {
        throw new exceptions.InternalFailure('session is no SessionProxy');
    }
}