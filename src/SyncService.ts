import SyncArea from "../dist/SyncArea";
import {
    IncomingEvents,
    InitSessionResponse,
    PatchAreaEvent,
    PatchAreaFail,
    PatchAreaResponse,
    SubscribeAreaFail,
    SubscribeAreaResponse,
    UnsubscribeAreaResponse
} from "./Events";
import { IEventListener } from "./IEventListener";
import { StompConnection } from "./StompConnection";

export default class SyncService implements IEventListener {

    private areas: { [key: string]: SyncArea } = {};

    public constructor(connection: StompConnection) {
        this.areas = {};
    }

    private onEvent(event: IncomingEvents): void {
        switch (event.type) {
            // sync
            case 's':
                return this.onPatchAreaResponse(event);
            case 'p':
                return this.onPatchAreaEvent(event);
            case 'patchAreaError':
                return this.onPatchAreaError(event);
            // init & configure
            case 'init':
                return this.onInit(event);
            // area subscription
            case 'areaSubscriptionError':
                return this.onSubscribeAreaFail(event);
            case 'areaSubscription':
                return this.onSubscribeAreaResponse(event);
            case 'areaUnsubscriptionSuccess':
                return this.onUnsubscribeAreaResponse(event);
        }
    }

    public onUserEvent(event: IncomingEvents): void {
        this.onEvent(event);
    }

    public onSessionEvent(event: IncomingEvents): void {
        this.onEvent(event);
    }

    private onInit(event: InitSessionResponse): void {
        return;
    }

    private onPatchAreaResponse(event: PatchAreaResponse) {
        this.areas[event.area].patchResponse(event);
    }

    private onPatchAreaEvent(event: PatchAreaEvent) {
        this.areas[event.area].serverPatch(event);
    }

    private onSubscribeAreaResponse(event: SubscribeAreaResponse) {
        this.areas[event.area].serverPatch(event);
    }

    private onUnsubscribeAreaResponse(event: UnsubscribeAreaResponse) {

    }

    // errors
    private onPatchAreaError(event: PatchAreaFail) {

    }

    private onSubscribeAreaFail(event: SubscribeAreaFail) {

    }

}