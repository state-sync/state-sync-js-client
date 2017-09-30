import StompConnection from "./StompConnection";
import SyncAreaRegistry from './SyncAreaRegistry';
import SyncArea from "./SyncArea";
import SyncAreaHelper from "./SyncAreaHelper";
import SyncAreaConfig from './SyncAreaConfig';

import SyncConfig from './SyncConfig';
import { IConnectionStatusListener, ConnectionStatusListenerSilent } from './IConnectionStatusListener';

export default class SyncService {
    connectionStatusListener: IConnectionStatusListener;

    private areas: SyncAreaRegistry;
    private connection: StompConnection;
    private config: SyncConfig;

    public constructor(config: SyncConfig, connectionStatusListener: IConnectionStatusListener) {
        this.config = config;
        this.areas = new SyncAreaRegistry();
        this.connectionStatusListener = connectionStatusListener ? connectionStatusListener : new ConnectionStatusListenerSilent();
        this.connection = new StompConnection(config, connectionStatusListener, this.areas);
    }

    public declareArea(id: string, config: SyncAreaConfig, reducer: any): any {
        let area = new SyncArea(id, config, this);
        return area.wrap(reducer);
    }
}