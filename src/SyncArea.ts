//import { Promise } from 'es6-promise';
import * as jiff from 'jiff';

import {
    PatchAreaError,
    PatchAreaEvent,
    PatchAreaRequest,
    PatchAreaResponse,
    SignalError,
    SignalRequest,
    SignalResponse,
    SubscribeAreaError,
    SubscribeAreaRequest,
    SubscribeAreaResponse,
    UnsubscribeAreaRequest,
    UnsubscribeAreaResponse
} from './Events';
import { InvocationMap } from "./InvocationMap";
import { ISyncArea } from './ISyncArea';
import SyncAreaConfig from './SyncAreaConfig';
import SyncAreaHelper from './SyncAreaHelper';
import find from './utils/find';
import { Patch } from './Patch';

export class SyncArea implements ISyncArea {
    private helper: SyncAreaHelper;
    public name: string;

    private subscriptionsCount: number;
    /**
     * Configuration retrieved from server in a process of subscription
     */
    private config: SyncAreaConfig;
    private shadow: any | null;
    private initialState: any;
    private subscribed: boolean = false;
    private patchQueue: Array<PatchAreaEvent> = [];
    private local: any;
    private invocations: InvocationMap;

    constructor(name: string, initialState: any, helper: SyncAreaHelper) {
        this.initialState = initialState;
        this.helper = helper;
        this.name = name;
        this.subscriptionsCount = 0;
        this.invocations = new InvocationMap();
    }

    public init() {

    }

    public wrap(reducer: any): any {
        return (state: any, action: any, ext: any) => this.reduce(state, action, ext, reducer);
    }

    /**
     * Invoke when connection is ready
     */
    public onReady() {
        this.doSubscription();
    }

    public subscribe() {
        this.subscriptionsCount++;
        this.doSubscription();
    }

    private doSubscription() {
        if (!this.subscribed && this.helper.isFullyConnected()) {
            this.subscribed = true;
            this.invocations.request(id => {
                this.helper.send(new SubscribeAreaRequest(id, this.name))
            });
        }
    }

    public unsubscribe() {
        this.subscriptionsCount--;
        if (this.subscriptionsCount == 0) {
            this.subscribed = false;
            this.invocations.request(id => {
                this.helper.send(new UnsubscribeAreaRequest(id, this.name))
            });
        }
    }

    public signal(command: string, parameters?: any): Promise<number> {
        return this.invocations.request(id => {
            this.helper.send(new SignalRequest(id, this.name, command, parameters));
        });
    }

    public onSignalResponse(event: SignalResponse) {
        if (this.invocations.response(event.forId)) {
            this.pushPatches();
        }
    }

    public onSignalError(event: SignalError) {
        if (this.invocations.error(event.forId, event.error)) {
            this.pushPatches();
        }
    }

    public onSubscribe(event: SubscribeAreaResponse) {
        this.invocations.response(event.forId);
        this.config = event.config;
        this.invocations.timeout = event.config.timeout;
        this.helper.dispatch({type: '@STATE_SYNC/SYNC_AREA_INIT', area: event.area, payload: event.model});
    }

    // tslint:disable
    public onUnsubscribe(event: UnsubscribeAreaResponse) {
        this.invocations.response(event.forId);
        this.config = new SyncAreaConfig();
        this.shadow = this.initialState;
        this.helper.dispatch({type: '@STATE_SYNC/SYNC_AREA_INIT', payload: this.initialState});
    }

    public dispatchSyncPatch(event: PatchAreaEvent) {
        this.helper.dispatch({type: '@STATE_SYNC/SYNC_AREA_SERVER_PATCH', area: event.area, payload: event.patch});
    }

    public onPatchResponse(event: PatchAreaResponse) {
        if (this.invocations.response(event.forId)) {
            this.pushPatches();
        }
    }

    private pushPatches(): void {
        this.patchQueue.forEach(cmd => {
            this.dispatchSyncPatch(cmd);
        });
        this.patchQueue = [];
    }

    public onServerPatch(event: PatchAreaEvent) {
        if (this.invocations.isEmpty()) {
            this.dispatchSyncPatch(event);
        } else {
            this.patchQueue.push(event);
        }
    }

    public onPatchAreaError(event: PatchAreaError) {
        console.error(event);
    }

    public onSubscribeError(event: SubscribeAreaError) {
        console.error(event);
    }

    public actionReplace(path: string, value: any) {
        this.helper.dispatch({
            type: '@STATE_SYNC/SYNC_AREA_LOCAL_PATCH', area: this.name, payload: [{
                op: 'replace', path: path, value: value
            }]
        });
    }

    public actionRemove(path: string) {
        this.helper.dispatch({
            type: '@STATE_SYNC/SYNC_AREA_LOCAL_PATCH', area: this.name, payload: [{
                op: 'remove', path: path
            }]
        });
    }

    public actionReduce(path: string, reducer: <T> (state: T) => T): void {
        try {
            let value = find(this.local, path);
            this.actionReplace(path, reducer(value));
        } catch (e) {
            console.error(e);
        }
    }

    public actionToggle(path: string) {
        try {
            let value = find(this.local, path);
            this.actionReplace(path, !value);
        } catch (e) {
            console.error(e);
        }
    }

    private reduce(state: any, action: any, ext: any, reducer: any): any {
        // initialization
        if (state === undefined) return this.initialState;

        //sync
        try {
            const fit = (this.name === action.area) && action.type.indexOf('@STATE_SYNC/') === 0;
            if (fit) {
                switch (action.type) {
                    case '@STATE_SYNC/SYNC_AREA_INIT':
                        return this.local = this.shadow = action.payload;
                    case '@STATE_SYNC/SYNC_AREA_SERVER_PATCH':
                        return this.local = this.shadow = new Patch(action.payload).apply(state);
                    case '@STATE_SYNC/SYNC_AREA_LOCAL_PATCH':
                        try {
                            return this.detectChanges(state, this.local = new Patch(action.payload).apply(state));
                        } catch (e) {
                            console.error('Local patch failed', state, action.payload);
                        }
                }
            }
        } catch (e) {
            console.error('action failed:', action, e);
        }

        // pass action to normal reducers
        return this.detectChanges(state, this.local = reducer ? reducer(state, action, ext) : state);
    }

    private detectChanges(from: any, to: any) {
        if (this.config) {
            let patch = jiff.diff(from, to);
            let roots = this.config.clientPush;
            let prefix = '/' + this.config.clientLocalPrefix;
            patch = patch
                .filter(op => op.path.indexOf(prefix) < 0)
                .filter(op => op.op !== 'test')
                .filter(
                    op => roots.filter(
                        root => op.path.indexOf(root) === 0
                    ).length > 0);

            if (patch.length > 0) {
                this.invocations.request(id => {
                    this.helper.send(new PatchAreaRequest(id, this.name, patch));
                });
            }
        }
        return to;
    }
}