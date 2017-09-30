import { IncomingEvents } from "./Events";

export interface IEventListener {
    onEvent(event: IncomingEvents): void;
}