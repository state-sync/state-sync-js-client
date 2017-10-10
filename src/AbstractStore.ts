/**
 * Represent generic store interface. Interface is compatible with both Redux and NgRx.
 */
export default interface AbstractStore {
    /**
     * Dispatch action
     * @param action action to dispatch, state-sync specially to not make any assumptions on action structure
     */
    dispatch(action: any): void;

    /**
     * Subscribe to the store. This method is used during initialization and we do not care about unsubscribing.
     * That is why return value is defined as void.
     * @param subscriber callback function
     */
    subscribe(subscriber: any): void;
}
