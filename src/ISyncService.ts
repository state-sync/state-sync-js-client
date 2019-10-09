import { ISyncArea } from './ISyncArea';
import { SyncConfig } from './SyncConfig';

/**
 * Primary sync service interface
 */
export interface ISyncService {
    /**
     * Connect store to remote server
     * @param store - Redux or NgRX store
     * @param url - websocket url
     * @param {SyncConfig} config - sync configuration
     */
    initSync(store: any, url: string, config?: any): void;

    /**
     * Declare sync area and return reducer for this area
     *
     * @param {string} name - unique name of area
     * @param initialState - initial state of area
     * @param reducer - optional reducer to perform state modification. Modifications made by this reducer are
     * automatically syncronized to server according sycn rules provided by server during subscription.
     * @param isLocal - if true, area do not synchronize with server
     * @returns reducer - reducer able for automatic sync of area data
     */
    declareArea(name: string, initialState: any, reducer?: any, isLocal?: boolean): any;

    /**
     * Declare sync status reducer
     * @returns reducer
     */
    declareStatusArea(): any;

    /**
     * Returns api for declared area
     * @param {string} area
     * @returns {ISyncArea}
     */
    area(area: string): ISyncArea;
}
