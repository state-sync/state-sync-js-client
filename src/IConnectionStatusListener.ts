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
    onDisconnect(): void;

    /**
     * Invoked then client connected to server and completely configured on service level,
     * but doesn't yet receive all confirmations for subscriptions.
     */
    onConfigured(): void;

    /**
     * Client is completely set up and can initialize syncareas.
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

    public onDisconnect() {
    }

    public onConfigured() {
    }

    public onReady() {

    }
}

/**
 * Delivery connection status to the store (redux or NgRx). Events dispatched as store events with
 * special "type" field instead of normally user "type" field. It is done intentionally to
 * prevent interference with usual UI actions.
 */
export class ConnectionStatusListenerForStore implements IConnectionStatusListener {
    /**
     * Reference to the store
     */
    private storeProvider: () => AbstractStore;

    /**
     * Construct listener using provider store interface
     * @param {AbstractStore} store
     */
    constructor(storeProvider: () => AbstractStore) {
        this.storeProvider = storeProvider;
    }

    private dispatchStatus(status: string) {
        this.storeProvider().dispatch({type: '@STATE_SYNC/CONNECTION_STATUS', status: status});
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