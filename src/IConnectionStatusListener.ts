import AbstractStore from './AbstractStore';

export interface IConnectionStatusListener {
    onConnecting(): void;

    onConnected(): void;

    onDisconnect(): void;

    onConfigured(): void;

    onReady(): void;
}

export class ConnectionStatusListenerSilent implements IConnectionStatusListener {
    public onConnecting(): void {
    }

    public onConnected() {
    }

    public onDisconnect() {
    }

    public onConfigured() {
    }

    public onReady() {

    }
}

/**
 * Delivery
 */
export class ConnectionStatusListenerForStore implements IConnectionStatusListener {
    private store: AbstractStore;

    constructor(store: AbstractStore) {
        this.store = store;
    }

    private dispatchStatus(status: string) {
        this.store.dispatch({__stateSyncEvent__: 'CONNECTION_STATUS', status: status});
    }

    public onReady(): void {
        this.dispatchStatus('ready');
    }


    public onConnecting(): void {
        this.dispatchStatus('connecting');
    }

    public onConnected() {
        this.dispatchStatus('connected');
    }


    public onDisconnect() {
        this.dispatchStatus('disconnected');
    }

    public onConfigured() {
        this.dispatchStatus('configured');
    }
}