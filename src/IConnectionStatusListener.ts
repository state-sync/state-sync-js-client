export interface IConnectionStatusListener {
    onConnecting(): void;

    onConnected(): void;

    onDisconnect(): void;

    onConfigured(): void;
}

export class ConnectionStatusListenerSilent {
    public onConnecting(): void {
    }

    public onConnected() {
    }

    public onDisconnect() {
    }

    public onConfigured() {
    }
}

/**
 * Delivery
 */
export class ConnectionStatusListenerForStore {
    private store: any;

    constructor(store: any) {
        this.store = store;
    }

    private dispatchStatus(status: string) {
        this.store.dispatch({type: 'STATE_SYNC_JS_CLIENT_CONNECTION_STATUS', status: status});
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