/**
 * Store area synchronized with server side. Sync rules are defined by server side.
 *
 */
export interface ISyncArea {
    /**
     * Replace value in area state
     * @param {string} path path to value
     * @param value new value
     */
    actionReplace(path: string, value: any): void;

    /**
     * Toggle value in area state
     * @param {string} path
     */
    actionToggle(path: string): void;

    /**
     * Select state part specified by path, modify by given reducer and push changes back to state.
     * As usual changes and synchronized back to server (if configured by server)
     * @param {string} path
     * @param {<T>(state: T) => T} reducer
     */
    actionReduce(path: string, reducer: <T> (state: T) => T): void;

    /**
     * Subscribe to synchronization, repeat call of this method increment refs counter.
     */
    subscribe(): void;

    /**
     * Unsubscribe area from synchronization. Decrement refs counter.
     * Actual subscription occurs then refs counter became zero.
     */
    unsubscribe(): void;

    /**
     * Send signal to server with parameters,
     * once completed and state syncronized with server, promise wil be resolved.
     * @param {string} command
     * @param parameters
     * @returns {Promise}
     */
    signal(command: string, parameters?: any): Promise<number>;
}