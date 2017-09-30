import { SyncAreaHelper } from "./SyncAreaHelper";

export default class SyncArea {
    private helper: SyncAreaHelper;
    private name: string;

    constructor(helper : SyncAreaHelper, name: string) {
        this.helper = helper;
        this.name = name;
    }

    patchResponse(event: PatchAreaResponse) {
        
    }
}