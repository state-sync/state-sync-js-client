export interface CloseReason {
    code: number;
    message: string;
    reconnect: boolean;
}

export class CloseResolver {

    public static resolve(event: CloseEvent): CloseReason {
        switch (event.code) {
            case 1000:
                return CloseResolver.reason(event, true, "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.");
            case 1001:
                return CloseResolver.reason(event, true, "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.");
            case 1002:
                return CloseResolver.reason(event, false, "An endpoint is terminating the connection due to a protocol error");
            case 1003:
                return CloseResolver.reason(event, false, "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message:.");
            case 1004:
                return CloseResolver.reason(event, false, "Reserved. The specific meaning might be defined in the future.");
            case 1005:
                return CloseResolver.reason(event, false, "No status code was actually present.");
            case 1006:
                return CloseResolver.reason(event, false, "The connection was closed abnormally, e.g., without sending or receiving a Close control frame");
            case 1007:
                return CloseResolver.reason(event, false, "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message:.");
            case 1008:
                return CloseResolver.reason(event, false, "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.");
            case 1009:
                return CloseResolver.reason(event, false, "An endpoint is terminating the connection because it has received a message that is too big for it to process.");
            case 1010: // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                return CloseResolver.reason(event, false, "An endpoint (client: is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. Specifically, the extensions that are needed are: " + event.reason);
            case 1011:
                return CloseResolver.reason(event, false, "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.");
            case 1015:
                return CloseResolver.reason(event, false, "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).");
            default:
                return CloseResolver.reason(event, false, "Unknown reason");
        }

    }

    private static reason(event: CloseEvent, reconnect: boolean, message: string): CloseReason {
        return {
            code: event.code,
            message: message,
            reconnect: reconnect
        }
    }
}
