/**
 * Represent some abstract store, Both Redux and NgRx are compatible
 */
export default interface AbstractStore {
    /**
     * Dispatch action
     * @param action
     * @returns {any}
     */
    dispatch(action: any): any;

    /**
     * Subscribe to store
     * @param listener
     * @returns {any}
     */
    subscribe(listener: any): any;
}
