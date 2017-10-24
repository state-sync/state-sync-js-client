import { ISyncAuthListener } from './ISyncAuthListener';

export class SyncConfig {
    public url: string;
    debug: boolean;
    timeout: number;
    debugConnectFrame: boolean;
    authListener: ISyncAuthListener;
    csrfUrl?: string;
    constructor() {
        this.debug = false;
        this.timeout = 5000;
    }

    static build(url: string, config?: SyncConfig) {
        config = config ? config : new SyncConfig();
        config.url = url;
        return config;
    }
}