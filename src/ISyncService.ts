import { SyncConfig } from './SyncConfig';
import { ISyncArea } from "./ISyncArea";

export interface ISyncService {
    /**
     * Connect store to remote server
     * @param store
     * @param url
     * @param {SyncConfig} config
     */
    initSync(store: any, url: string, config?: any): void;

    /**
     * Declare sync area and return reducer for this area
     *
     * @param {string} name
     * @param initialState
     * @param reducer
     * @returns reducer
     */
    declareArea(name: string, initialState: any, reducer?: any): any;

    /**
     * Declare status reducer
     * @returns reducer
     */
    declareStatusArea(): any

    /**
     * Returns api for declared area
     * @param {string} area
     * @returns {ISyncArea}
     */
    area(area: string): ISyncArea;
}