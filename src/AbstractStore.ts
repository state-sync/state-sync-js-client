/**
 * Represent generic store interface, Both Redux and NgRx are compatible
 */
export default interface AbstractStore {
    /**
     * Dispatch action
     * @param action action to dispatch, state-sync specially to not made assumptions on action structure
     */
    dispatch(action: any): void;

    /**
     * Subscribe to the store. This method is used during initialization and we do not care about unsubscribing.
     * That is why return value is defined as void.
     * @param subscriber callback function
     */
    subscribe(subscriber: any): void;
}
