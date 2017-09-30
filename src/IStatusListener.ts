export abstract class IStatusListener {
    abstract dispatch(param: { type: string; status: string }): void;

    onConnecting(): void {
        this.dispatchStatus('connecting');
    }

    onConnected() {
        this.dispatchStatus('connected');
    }

    private dispatchStatus(status: string) {
        this.dispatch({type: 'STATE_SYNC_CONNECTION_STATUS', status: status});
    }

    onDisconnect() {
        this.dispatchStatus('disconnected');
    }

    onConfigured() {
        this.dispatchStatus('configured');
    }
}