import {
    IncomingEvents,
    InitSessionResponse,
    PatchAreaEvent,
    PatchAreaError,
    PatchAreaResponse, SignalError,
    SignalResponse,
    SubscribeAreaError,
    SubscribeAreaResponse,
    UnsubscribeAreaResponse
} from './Events';
import { IEventListener } from './IEventListener';
import { ISyncArea } from './ISyncArea';
import { SyncArea } from './SyncArea';

export default class SyncAreaRegistry implements IEventListener {
    private areas: { [p: string]: SyncArea };

    public constructor() {
        this.areas = {};
    }

    public add(area: SyncArea) {
        if(this.areas[area.name]) {
            throw new Error("Sync area redeclaration "+ area.name);
        }
        this.areas[area.name] = area;
    }

    public get(name: string): ISyncArea {
        return this.areas[name];
    }

    public forEach(callback: (area: SyncArea) => any): void {
        for (var key in this.areas) {
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

            // signals
            case 'signalResponse':
                return this.onSignalResponse(event);
            case 'signalError':
                return this.onSignalError(event);

            // area subscription
            case 'areaSubscriptionError':
                return this.onSubscribeAreaError(event);
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
    private onPatchAreaError(event: PatchAreaError) {
        this.areas[event.area].onPatchAreaError(event);
        console.error(event);
    }

    private onSubscribeAreaError(event: SubscribeAreaError) {
        this.areas[event.area].onSubscribeError(event);
        console.error(event);
    }

    private onSignalResponse(event: SignalResponse) {
        this.areas[event.area].onSignalResponse(event);
    }

    private onSignalError(event: SignalError) {
        this.areas[event.area].onSignalError(event);
    }
}