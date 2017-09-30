import { SyncAreaHelper } from "./SyncAreaHelper";
import {
    PatchAreaEvent, PatchAreaFail, PatchAreaResponse, SubscribeAreaFail, SubscribeAreaResponse,
    UnsubscribeAreaResponse
} from "./Events";

export default class SyncArea {
    private helper: SyncAreaHelper;
    private name: string;

    constructor(helper : SyncAreaHelper, name: string) {
        this.helper = helper;
        this.name = name;
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