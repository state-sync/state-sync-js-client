import AbstractStore from './AbstractStore';

/**
 * Interface of connection status listener.
 */
export interface IConnectionStatusListener {
    /**
     * Invoked then client starts connecting to the server
     */
    onConnecting(): void;

    /**
     * Invoked then client actually connected to the server, but still do not completely ready to serve.
     */
    onConnected(): void;

    /**
     * Invoked on disconnect for any reason
     */
    onDisconnect(reconnectTimeout: number): void;

    /**
     * Invoked then client connected to server and completely configured on service level,
     * but doesn't yet receive all confirmations for subscriptions.
     */
    onConfigured(): void;

    /**
     * Client is completely set up and can initialize sync areas.
     */
    onReady(): void;
}

/**
 * This implementation just skip all events and keep silent
 */
export class ConnectionStatusListenerSilent implements IConnectionStatusListener {
    public onConnecting(): void {
    }

    public onConnected() {
    }

    public onDisconnect(reconnectTimeout: number) {
    }

    public onConfigured() {
    }

    public onReady() {

    }
}

/**
 * Delivery connection status to the store (redux or NgRx).
 */
export class ConnectionStatusListenerForStore implements IConnectionStatusListener {
    /**
     * Reference to the store
     */
    private storeProvider: () => AbstractStore;

    /**
     * Construct listener using provider store interface
     * @param {AbstractStore} storeProvider
     */
    constructor(storeProvider: () => AbstractStore) {
        this.storeProvider = storeProvider;
        setInterval(() =>
            this.storeProvider().dispatch({type: '@STATE_SYNC/CONNECTION_STATUS_TICK'}), 1000);
    }

    private dispatchStatus(payload: any) {
        this.storeProvider().dispatch({type: '@STATE_SYNC/CONNECTION_STATUS', payload: payload});
    }

    public onReady(): void {
        this.dispatchStatus( {status:'ready'});
    }

    public onConnecting(): void {
        this.dispatchStatus({status:'connecting'});
    }

    public onConnected() {
        this.dispatchStatus({status:'connected'});
    }

    public onDisconnect(reconnectTimeout: number) {
        this.dispatchStatus({status:'disconnected', reconnectTimeout: reconnectTimeout});
    }

    public onConfigured() {
        this.dispatchStatus({status:'configured'});
    }
}