import { ISyncAuthListener } from './ISyncAuthListener';

/**
 * State sync configuration
 */
export class SyncConfig {
    /**
     * If true, library do not connect to server, instead of that
     */
    public local?: boolean;
    public url: string;
    public debug: boolean;
    public timeout: number;
    public debugConnectFrame: boolean;
    public authListener: ISyncAuthListener;
    public csrfUrl?: string;
    public checkTokenUrl?: string;
    public accessToken: string;
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