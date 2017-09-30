import { Promise } from 'es6-promise';
import * as jiff from 'jiff';
import * as jsonpatch from 'jsonpatch';

import {
    PatchAreaEvent,
    PatchAreaFail,
    PatchAreaRequest,
    PatchAreaResponse,
    RpcRequest,
    SubscribeAreaFail,
    SubscribeAreaRequest,
    SubscribeAreaResponse,
    UnsubscribeAreaRequest,
    UnsubscribeAreaResponse
} from './Events';
import SyncAreaConfig from './SyncAreaConfig';
import SyncAreaHelper from './SyncAreaHelper';
import find from './utils/find';

export default class SyncArea {
    lastRequestId: any;
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
    private lastHandledRequest: number;
    private patchQueue: Array<PatchAreaEvent> = [];
    private local: any;
    private promises: { [p: number]: any } = {};

    constructor(name: string, initialState: any, helper: SyncAreaHelper) {
        this.initialState = initialState;
        this.helper = helper;
        this.name = name;
        this.subscriptionsCount = 0;
    }

    public init() {

    }

    public wrap(reducer: any): any {
        return (state: any, action: any, ext: any) => this.reduce(state, action, ext, reducer);
    }

    public onReady() {
        this.subscribe();
    }

    public subscribe() {
        this.subscriptionsCount++;
        if (!this.subscribed) {
            this.subscribed = true;
            this.lastRequestId++;
            this.helper.send(new SubscribeAreaRequest(this.lastRequestId, this.name));
        }
    }

    public unsubscribe() {
        this.subscriptionsCount--;
        if (this.subscriptionsCount == 0) {
            this.subscribed = false;
            this.lastRequestId++;
            this.helper.send(new UnsubscribeAreaRequest(this.lastRequestId, this.name));
        }
    }

    public remote(command: string, parameters: any) {
        let rid = this.lastRequestId++;
        this.helper.send(new RpcRequest(rid, this.name, command, parameters));
        const promise = new Promise<number>((resolve, reject) => {
            this.promises[rid] = resolve;
            setTimeout(() => {
                let p = this.promises[rid];
                if (p) {
                    p();
                    delete this.promises[rid];
                }
            }, this.config.commandTimeout);
        });
        return promise;
    }

    public onSubscribe(event: SubscribeAreaResponse) {
        this.config = event.config;
        this.helper.dispatch({__stateSyncEvent__: 'SYNC_AREA_INIT', payload: event.model});
    }

    // tslint:disable
    public onUnsubscribe(_event: UnsubscribeAreaResponse) {
        this.config = new SyncAreaConfig();
        this.helper.dispatch({__stateSyncEvent__: 'SYNC_AREA_INIT', payload: this.initialState});
    }

    public dispatchSyncPatch(event: PatchAreaEvent) {
        this.helper.dispatch({type: 'SYNC_AREA_PATCH', area: event.area, payload: event.patch});
    }

    public onPatchResponse(event: PatchAreaResponse) {
        this.lastHandledRequest = event.forId;
        this.patchQueue.forEach(cmd => {
            this.dispatchSyncPatch(cmd);
        });
        this.patchQueue = [];
    }

    public onServerPatch(event: PatchAreaEvent) {
        this.patchQueue.push(event);
    }

    public onPatchAreaError(event: PatchAreaFail) {
        console.error(event);
    }

    public onSubscribeError(event: SubscribeAreaFail) {
        console.error(event);
    }

    public actionReplace(path: string, value: any) {
        this.helper.dispatch({
            type: 'SYNC_AREA_LOCAL_PATCH', area: this.name, payload: [{
                op: 'replace', path: path, value: value
            }]
        });
    }

    public actionToggle(path: string) {
        try {
            let p = find(this.local, path);
            let value = p.get(this.local);
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
            const fit = action.__stateSyncEvent__ && (this.name === action.area);
            if (fit) {
                switch (action.__stateSyncEvent__) {
                    case 'SYNC_AREA_INIT':
                        return this.local = this.shadow = action.payload;
                    case 'SYNC_AREA_SERVER_PATCH':
                        return this.local = this.shadow = jsonpatch.apply_patch(state, action.payload);
                    case 'SYNC_AREA_LOCAL_PATCH':
                        try {
                            return this.detectChanges(state, this.local = jsonpatch.apply_patch(state, action.payload));
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
        let patch = jiff.diff(from, to);
        let roots = this.config.clientPush;
        let prefix = '/' + this.config.clientLocalPrefix;
        patch = patch
            .filter(op => op.path.indexOf(prefix) < 0)
            .filter(
                op => roots.filter(
                    root => op.path.indexOf(root) === 0
                ).length > 0);

        if (patch.length > 0) {
            this.lastRequestId++;
            this.helper.send(new PatchAreaRequest(this.lastRequestId, this.name, patch));
        }
    }

}