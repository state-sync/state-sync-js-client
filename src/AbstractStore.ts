/**
 * Represent some abstract store, Both Redux and NgRx are compatible
 */
export default interface AbstractStore {
    /**
     * Dispatch action
     * @param action action to dispatch, state-sync specially to not mae assumptions on action structure
     */
    dispatch(action: any): void;

    /**
     * Subscribe to the store. This method is used during initialization and we sdo not care about unsubscribing.
     * That is why return value is defined as void.
     * @param subscriber subscribing function
     */
    subscribe(subscriber: any): void;
}
