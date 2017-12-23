//import { Promise } from 'es6-promise';
import * as jiff from 'jiff';

import { PatchAreaError, PatchAreaEvent, PatchAreaRequest, PatchAreaResponse, SignalError, SignalRequest, SignalResponse, SubscribeAreaError, SubscribeAreaRequest, SubscribeAreaResponse, UnsubscribeAreaRequest, UnsubscribeAreaResponse } from './Events';
import { InvocationMap } from "./InvocationMap";
import { ISyncArea } from './ISyncArea';
import { OpSelect, Patch } from './Patch';
import SyncAreaConfig from './SyncAreaConfig';
import SyncAreaHelper from './SyncAreaHelper';
import find from './utils/find';

export class SyncArea implements ISyncArea {
    private helper: SyncAreaHelper;
    public name: string;

    private subscriptionsCount: number;
    /**
     * Configuration retrieved from server in a process of subscription
     */
    private config: SyncAreaConfig;
    private initialState: any;
    private subscribed: boolean = false;
    private patchQueue: Array<PatchAreaEvent> = [];
    private invocations: InvocationMap;
    /**
     * Local copy of state, updated by reducer, used by actions to get current values
     */
    private local: any;
    private ready: boolean;
    private modelVersion: number;

    constructor(name: string, initialState: any, helper: SyncAreaHelper) {
        this.initialState = initialState;
        this.helper = helper;
        this.name = name;
        this.subscriptionsCount = 0;
        this.invocations = new InvocationMap();
        this.ready = false;
        this.modelVersion = 0;
    }

    isReady(): boolean {
        return this.ready;
    }

    public init() {
        this.helper.dispatch({type: '@STATE_SYNC/SYNC_AREA_STATUS', area: this.name, status: 'disconnected', ready: false});
    }

    public wrap(reducer: any): any {
        return (state: any, action: any, ext: any) => this.reduce(state, action, ext, reducer);
    }

    public model(): any {
        return this.local;
    }

    select(path: string) {
        return new OpSelect({op: 'select', path: path}).apply(this.local);
    }

    /**
     * Invoke when connection is ready
     */
    public onReady() {
        this.doSubscription();
    }

    public subscribe(): Promise<number> {
        this.subscriptionsCount++;
        return this.doSubscription();
    }

    private doSubscription(): Promise<number> {
        if (!this.subscribed && this.helper.isFullyConnected()) {
            this.subscribed = true;
            return this.invocations.request(id => {
                this.helper.send(new SubscribeAreaRequest(id, this.name))
            });
        } else {
            return new Promise((resolve, error) => resolve(0));
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
        this.ready = true;
        this.invocations.response(event.forId);
        this.config = event.config;
        this.invocations.timeout = event.config.timeout;
        this.helper.dispatch({type: '@STATE_SYNC/SYNC_AREA_INIT', area: event.area, payload: event.model});
        this.helper.dispatch({type: '@STATE_SYNC/SYNC_AREA_STATUS', area: event.area, status: 'ready', ready: true});
    }

    // tslint:disable
    public onUnsubscribe(event: UnsubscribeAreaResponse) {
        this.ready = false;
        this.invocations.response(event.forId);
        this.config = new SyncAreaConfig();
        this.helper.dispatch({type: '@STATE_SYNC/SYNC_AREA_STATUS', area: event.area, status: 'disconnected', ready: false});
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

    public actionArrayInsertByKey(path: string, item: any, keyField: string): void {
        this.actionReduce(path, (array: any[]) => {
            if (array) {
                let tmp = [...array, item];
                tmp.sort((a, b) => {
                    const ak = a[keyField];
                    const bk = b[keyField];
                    if (ak < bk) {
                        return -1;
                    }
                    if (ak > bk) {
                        return 1;
                    }
                    return 0;
                });
                return tmp;
            } else {
                return [item];
            }
        });
    }

    public actionArrayReplaceByKey(path: string, data: any, keyField: string): void {
        this.actionReduce(path, (array: any[]) => {
            let copy = [...array];
            for (let i = 0; i < copy.length; i++) {
                let item = copy[i];
                if (item[keyField] === data[keyField]) {
                    copy[i] = item;
                }
            }
            return copy;
        });

    }

    public actionArrayRemoveByKey(path: string, keyField: string, value: any): void {
        this.actionReduce(path, (array: any[]) => {
            let tmp = [...array];
            tmp.filter(item => item[keyField] == value);
            return tmp;
        });
    }

    public actionArrayRemoveByIndex(path: string, index: number): void {
        this.actionReduce(path, (array: any[]) => {
            return array.splice(index, 1);
        });
    }

    public actionReplace(path: string, value: any) {
        this.helper.dispatch({
            type: '@STATE_SYNC/SYNC_AREA_LOCAL_PATCH', area: this.name, payload: [{
                op: 'replace', path: path, value: value
            }]
        });
    }

    public actionRemove(path: string, condition?: (item:any) => boolean): void {
        try {
            let value = find(this.local, path);
            if(!condition || condition(value)) {
                this.helper.dispatch({
                    type: '@STATE_SYNC/SYNC_AREA_LOCAL_PATCH', area: this.name, payload: [{
                        op: 'remove', path: path
                    }]
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    public actionReduce<T>(path: string, reducer: (state: T) => T): void {
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

        // sync
        try {
            const fit = (this.name === action.area) && action.type.indexOf('@STATE_SYNC/') === 0;
            if (fit) {
                switch (action.type) {
                    case '@STATE_SYNC/SYNC_AREA_INIT':
                        this.local = action.payload;
                        this.local.syncStateLastUpdateVersion = this.modelVersion++;
                        return this.local;
                    case '@STATE_SYNC/SYNC_AREA_SERVER_PATCH':
                        this.local = new Patch(action.payload).apply(state);
                        this.local.syncStateLastUpdateVersion = this.modelVersion++;
                        return this.local;
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
            // if state is the same - skip detection.
            if (to === from) {
                return to;
            }
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