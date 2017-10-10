import SyncAreaConfig from './SyncAreaConfig';

/**
 * Generic representation of messages flying between client and server
 */
export interface Message {
    /**
     * All messages are identified by type. Read about discriminated unions first
     * @link https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
     */
    type: string;
}

/**
 * Event message is come form server side and signals about some model changes do not related to user actions.
 */
export interface EventMessage extends Message {

}

/**
 * Request message sent by client. Server must respond with one of response messages.
 */
export abstract class RequestMessage implements Message {
    /**
     * See Message#type description
     */
    type: string;
    /**
     * Identifier of request in the scope of current session
     */
    id: number;

    /**
     * Construct new request message
     * @param {number} id request identifier
     * @param {string} type request type
     */
    constructor(id: number, type: string) {
        this.id = id;
        this.type = type;
    }
}

/**
 * Response message for user request.
 * Response message to not provide any other information except request id and message type.
 * Basic flow to all request/response are:
 * - client sent request
 * - server respond with json path to all user sessions (to sync data across browsers)
 * - server respond with response message
 */
export interface ResponseMessage extends Message {
    /**
     * Identifier of original request
     */
    forId: number;
}

/**
 * Event received as request of client connect to stat-sync server.
 */
export interface InitSessionResponse extends EventMessage {
    /**
     * Event id
     */
    type: 'init';
    /**
     * Session token is issued by server and used by client to securely subscribe to changes relevant to session.
     */
    sessionToken: string;
    /**
     * User token is issued by server and used by client to securely subscribe to changes
     * relevant to user in any connected session.
     */
    userToken: string;
    /**
     * Version of protocol
     */
    protocolVersion: string;
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
//---------------- code review stop

/**
 *
 */
export interface PatchAreaError {
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

export interface SubscribeAreaError extends ResponseMessage {
    type: 'areaSubscriptionError';
    area: string;
    error: string;
}

export class SignalRequest extends RequestMessage {
    area: string;
    private signal: string;
    private parameters: any;

    constructor(id: number, area: string, signal: string, parameters?: any) {
        super(id, 'signal');
        this.area = area;
        this.signal = signal;
        this.parameters = parameters;
    }
}

export interface SignalResponse extends ResponseMessage {
    type: 'signalResponse';
    area: string;
}

export interface SignalError extends ResponseMessage {
    type: 'signalError';
    area: string;
    error: string;
}

export class UnsubscribeAreaRequest extends RequestMessage {
    area: string;

    constructor(id: number, area: string) {
        super(id, 'unsubscribeArea');
        this.area = area;
    }
}

export interface UnsubscribeAreaResponse extends ResponseMessage {
    type: 'areaUnsubscriptionSuccess';
    area: string;
}

export type IncomingEvents =
    | InitSessionResponse

    | PatchAreaError
    | PatchAreaResponse
    | PatchAreaEvent

    | SignalResponse
    | SignalError

    | SubscribeAreaError
    | SubscribeAreaResponse

    | UnsubscribeAreaResponse