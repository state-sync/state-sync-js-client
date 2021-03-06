import AbstractStore from './AbstractStore';
import { RequestMessage } from './Events';
import {
    ConnectionStatusListenerForStore,
    ConnectionStatusListenerSilent,
    IConnectionStatusListener
} from './IConnectionStatusListener';
import { ISyncArea } from './ISyncArea';
import { ISyncService } from './ISyncService';
import StateSyncStatusReducer from './StateSyncStatusReducer';
import StompConnection from './StompConnection';
import { SyncArea } from './SyncArea';
import SyncAreaHelper from './SyncAreaHelper';
import SyncAreaRegistry from './SyncAreaRegistry';

import { SyncConfig } from './SyncConfig';

class SyncService implements ISyncService, SyncAreaHelper {
    isFullyConnected(): boolean {
        return this.connection.isFullyConnected();
    }

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
    public initSync(store: any, url: string, config?: SyncConfig): void {
        this.config = SyncConfig.build(url, config);
        this.store = store;
        if (!this.connection) {
            if(config) {
                if (!this.connectionStatusListener) {
                    this.connectionStatusListener = new ConnectionStatusListenerSilent();
                    console.info('ConnectionStatusListenerSilent')
                }
                this.connection = new StompConnection(this.config, this.connectionStatusListener, this.areas, () => this.onReady());
                this.connection.connect();
            }
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
    public declareArea(name: string, initialState: any, reducer?: any, isLocal?: boolean): any {
        let area = new SyncArea(name, initialState, this, isLocal || false);
        this.areas.add(area);
        return area.wrap(reducer);
    }

    public area(name: string): ISyncArea {
        return this.areas.get(name);
    }

    /**
     * Declare status reducer
     * @returns reducer
     */
    public declareStatusArea(): any {
        this.connectionStatusListener = new ConnectionStatusListenerForStore(() => this.store);
        return StateSyncStatusReducer;
    }

    private onReady() {
        this.areas.forEach(a => a.onReady());
    }
}

let Instance: ISyncService = new SyncService();

export const StateSync = (): ISyncService => {
    return Instance;
};
