import { IncomingEvents } from "./Events";

export interface IEventListener {
    onUserEvent(event: IncomingEvents): void;
    onSessionEvent(event: IncomingEvents): void;
}