export default class SyncConfig {
    public url: string;
    debug: boolean;
    timeout: number;
    debugConnectFrame: boolean;
    constructor(url : string) {
        this.url = url;
        this.debug = false;
        this.timeout = 5000;
    }
}