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
    actionToggle(path: string) : void;

    /**
     * Subscribe to synchronization, repeat call of this method increment refs counter.
     */
    subscribe(): void;

    /**
     * Unsubscribe area from synchronization. Decrement refs counter.
     * Actual subscription occurs then refs counter became zero.
     */
    unsubscribe(): void;

}