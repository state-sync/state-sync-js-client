import AbstractStore from "./AbstractStore";
import {
    ConnectionStatusListenerForStore,
    ConnectionStatusListenerSilent,
    IConnectionStatusListener
} from './IConnectionStatusListener';
import StateSyncStatusReducer from './StateSyncStatusReducer';
import StompConnection from './StompConnection';
import SyncArea from './SyncArea';
import SyncAreaConfig from './SyncAreaConfig';
import SyncAreaHelper from './SyncAreaHelper';
import SyncAreaRegistry from './SyncAreaRegistry';

import SyncConfig from './SyncConfig';
import purify from './utils/purify';

export default class SyncService implements SyncAreaHelper {
    private store: AbstractStore;
    private areas: SyncAreaRegistry;
    private connection: StompConnection;
    private config: SyncConfig;
    private connectionStatusListener: IConnectionStatusListener;

    public constructor() {
        this.areas = new SyncAreaRegistry();
    }

    /**
     * Connect store to remote server
     * @param store
     * @param {SyncConfig} config
     */
    public connect(store: any, url: string, config: SyncConfig): void {
        this.config = SyncConfig.build(url, config);
        this.store = store;
        this.areas.forEach((area) => area.init());
        if (!this.connection) {
            if (!this.connectionStatusListener) {
                this.connectionStatusListener = new ConnectionStatusListenerSilent();
            }
            this.connection = new StompConnection(this.config, this.connectionStatusListener, this.areas);
        }
    }

    /**
     * Declare sync area and return reducer for this area
     * @param {string} name
     * @param {SyncAreaConfig} config
     * @param reducer - optional reducer over same area
     * @returns {any}
     */
    public declareArea(name: string, config: SyncAreaConfig, reducer: any): any {
        let area = new SyncArea(name, config, this);
        this.areas.add(area);
        return area.wrap(reducer);
    }

    /**
     * Declare status reducer
     * @returns reducer
     */
    public declareStatusArea(): any {
        this.connectionStatusListener = new ConnectionStatusListenerForStore(this.store);
        return StateSyncStatusReducer;
    }
}