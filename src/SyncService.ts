import AbstractStore from './AbstractStore';
import { RequestMessage } from './Events';
import {
    ConnectionStatusListenerForStore,
    ConnectionStatusListenerSilent,
    IConnectionStatusListener
} from './IConnectionStatusListener';
import ISyncService from './ISyncService';
import StateSyncStatusReducer from './StateSyncStatusReducer';
import StompConnection from './StompConnection';
import SyncArea from './SyncArea';
import SyncAreaHelper from './SyncAreaHelper';
import SyncAreaRegistry from './SyncAreaRegistry';

import SyncConfig from './SyncConfig';

export default class SyncService implements ISyncService, SyncAreaHelper {

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
     * @param url
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
            this.connection = new StompConnection(this.config, this.connectionStatusListener, this.areas, () => this.onReady());
        }
    }

    dispatch(action: object): void {
        this.store.dispatch(action);
    }

    send(event: RequestMessage): void {
        this.connection.send(event);
    }

    /**
     * Declare sync area and return reducer for this area
     *
     * @param {string} name
     * @param initialState
     * @param reducer
     * @returns reducer
     */
    public declareArea(name: string, initialState: any, reducer: any): any {
        let area = new SyncArea(name, initialState, this);
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

    private onReady() {
        this.areas.forEach(a => a.onReady());
    }
}