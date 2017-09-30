import SyncAreaConfig from './SyncAreaConfig';

export interface Message {
    type: string;
}

export interface EventMessage extends Message {

}

export class RequestMessage implements Message {
    type: string;
    id: number;

    constructor(id: number, type: string) {
        this.id = id;
        this.type = type;
    }
}

export interface ResponseMessage extends Message {
    forId: number;
}

// init
export interface InitSessionResponse extends EventMessage {
    type: 'init';
    sessionToken: string;
    userToken: string;
}

// patch
export interface PatchAreaFail {
    type: 'patchAreaError';
    area: string;
    error: string;
}

export class PatchAreaRequest extends RequestMessage {
    area: string;
    patch: Array<object>;

    public constructor(id: number, area: string, patch: Array<object>) {
        super(id, 'p'); //reduce traffic
        this.area = area;
        this.patch = patch;
    }
}

export interface PatchAreaEvent extends EventMessage {
    type: 'p'; //reduce traffic
    area: string;
    patch: Array<object>;
}

export interface PatchAreaResponse extends ResponseMessage {
    type: 's'; //reduce traffic
    area: string;
}

export interface SubscribeAreaFail extends ResponseMessage {
    type: 'areaSubscriptionError';
    area: string;
    error: string;
}

export class SubscribeAreaRequest extends RequestMessage {
    area: string;

    constructor(id: number, area: string) {
        super(id, 'subscribeArea');
        this.area = area;
    }
}

export interface SubscribeAreaResponse extends ResponseMessage {
    type: 'areaSubscription';
    area: string;
    config: SyncAreaConfig;
    model: object;
}

export class UnsubscribeAreaRequest extends RequestMessage {
    area: string;

    constructor(id: number, area: string) {
        super(id, 'unsubscribeArea');
        this.area = area;
    }
}

export class RpcRequest extends RequestMessage {
    area: string;
    command: string;
    parameners: any;

    constructor(id: number, area: string, command: string, parameners: any) {
        super(id, 'rpc');
        this.area = area;
        this.command = command;
        this.parameners = parameners;
    }
}

export interface UnsubscribeAreaResponse extends ResponseMessage {
    type: 'areaUnsubscriptionSuccess';
    area: string;
}

export type IncomingEvents =
    | InitSessionResponse

    | PatchAreaFail
    | PatchAreaResponse
    | PatchAreaEvent

    | SubscribeAreaFail
    | SubscribeAreaResponse

    | UnsubscribeAreaResponse