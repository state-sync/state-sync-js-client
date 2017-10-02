import { RequestMessage } from './Events';

export default interface SyncAreaHelper {
    send(event: RequestMessage): void;

    dispatch(action: object): void;

    isFullyConnected(): boolean;
}