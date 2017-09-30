import {
    IncomingEvents,
    InitSessionResponse,
    PatchAreaEvent,
    PatchAreaFail,
    PatchAreaResponse,
    SubscribeAreaFail,
    SubscribeAreaResponse,
    UnsubscribeAreaResponse
} from './Events';
import { IEventListener } from './IEventListener';
import SyncArea from './SyncArea';

export default class SyncAreaRegistry implements IEventListener {
    private areas: { [p: string]: SyncArea };

    public constructor() {
        this.areas = {};
    }

    public add(area: SyncArea) {
        this.areas[area.name] = area;
    }

    public forEach(callback: (area: SyncArea) => any): void {
        for(var key in this.areas) {
            callback(this.areas[key]);
        }
    }

    public onEvent(event: IncomingEvents): void {
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

    private onInit(event: InitSessionResponse): void {
        return;
    }

    private onPatchAreaResponse(event: PatchAreaResponse) {
        this.areas[event.area].onPatchResponse(event);
    }

    private onPatchAreaEvent(event: PatchAreaEvent) {
        this.areas[event.area].onServerPatch(event);
    }

    private onSubscribeAreaResponse(event: SubscribeAreaResponse) {
        this.areas[event.area].onSubscribe(event);
    }

    private onUnsubscribeAreaResponse(event: UnsubscribeAreaResponse) {
        this.areas[event.area].onUnsubscribe(event);
    }

    // errors
    private onPatchAreaError(event: PatchAreaFail) {
        this.areas[event.area].onPatchAreaError(event);
        console.error(event);
    }

    private onSubscribeAreaFail(event: SubscribeAreaFail) {
        this.areas[event.area].onSubscribeError(event);
        console.error(event);
    }
}