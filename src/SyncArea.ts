import SyncAreaHelper from "./SyncAreaHelper";
import SyncAreaConfig from './SyncAreaConfig';

import {
    PatchAreaEvent, PatchAreaFail, PatchAreaResponse, SubscribeAreaFail, SubscribeAreaResponse,
    UnsubscribeAreaResponse
} from "./Events";

export default class SyncArea {
    private helper: SyncAreaHelper;
    public name: string;
    private config: SyncAreaConfig;

    constructor(name: string, config: SyncAreaConfig, helper : SyncAreaHelper) {
        this.config = config;
        this.helper = helper;
        this.name = name;
    }

    init() {

    }

    wrap(reducer: any): any {
        return (state:any, action:any) => this.reduce(state, action, reducer);
    }

    private reduce(state: any, action: any, reducer: any) {

    }

    onPatchResponse(event: PatchAreaResponse) {

    }

    onServerPatch(event: PatchAreaEvent) {
        
    }

    onSubscribe(event: SubscribeAreaResponse) {
        
    }

    onUnsubscribe(event: UnsubscribeAreaResponse) {
        
    }

    onPatchAreaError(event: PatchAreaFail) {

    }

    onSubscribeError(event: SubscribeAreaFail) {

    }

}