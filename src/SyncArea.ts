import SyncAreaHelper from "./SyncAreaHelper";
import SyncAreaConfig from './SyncAreaConfig';

import {
    PatchAreaEvent, PatchAreaFail, PatchAreaResponse, SubscribeAreaFail, SubscribeAreaResponse,
    UnsubscribeAreaResponse
} from "./Events";

export default class SyncArea {
    private helper: SyncAreaHelper;
    private name: string;
    private config: SyncAreaConfig;

    constructor(name: string, config: SyncAreaConfig, helper : SyncAreaHelper) {
        this.config = config;
        this.helper = helper;
        this.name = name;
    }

    wrap(reducer: any): any {

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