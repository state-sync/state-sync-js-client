export interface PatchOperation {
    op: string;
    path: string;
    value?: string;
    from?: string;
}

export abstract class Op {
    path: string[];

    public constructor(src: PatchOperation) {
        this.path = src.path.split('/').slice(1);
    }

    public abstract apply(json: any): any;
}

class OpReplace extends Op {
    private value?: any;
    private root: boolean;

    public constructor(src: PatchOperation) {
        super(src);
        this.root = src.path === '' || src.path === '/';
        this.value = src.value;
    }

    public apply(json: any): any {
        return this.root ? this.value : this.applySegment(json, 0);
    }

    private applySegment(json: any, index: number): any {
        let clone = json instanceof Array ? [...json] : {...json};
        if (index + 1 < this.path.length) {
            clone[this.path[index]] = this.applySegment(clone[this.path[index]] || {}, index + 1);
        } else {
            clone[this.path[index]] = this.value;
        }
        return clone;
    }
}

class OpCopy extends Op {
    private value?: any;
    private root: boolean;
    private from: OpSelect;

    public constructor(src: PatchOperation) {
        super(src);
        this.root = src.path === '' || src.path === '/';
        this.from = new OpSelect({op: 'select', path: src.from || '/'});
    }

    public apply(json: any): any {
        this.value = JSON.parse(JSON.stringify(this.from.apply(json)));
        return this.root ? this.value : this.applySegment(json, 0);
    }

    private applySegment(json: any, index: number): any {
        let clone = json instanceof Array ? [...json] : {...json};
        if (index + 1 < this.path.length) {
            clone[this.path[index]] = this.applySegment(clone[this.path[index]] || {}, index + 1);
        } else {
            clone[this.path[index]] = this.value;
        }
        return clone;
    }
}

export class OpSelect extends Op {
    private root: boolean;

    public constructor(src: PatchOperation) {
        super(src);
        this.root = src.path === '' || src.path === '/';
    }

    public apply(json: any): any {
        const p = this.path;
        for(let i=0; i< p.length;i++) {
            json = json ? json[p[i]] : null;
        }
        return json;
    }
}

class OpAdd extends Op {
    private value?: any;

    public constructor(src: PatchOperation) {
        super(src);
        this.value = src.value;
    }

    public apply(json: any): any {
        return this.applySegment(json, 0);
    }

    private applySegment(json: any, index: number): any {
        let clone = json instanceof Array ? [...json] : {...json};
        if (index + 1 < this.path.length) {
            clone[this.path[index]] = this.applySegment(clone[this.path[index]] || {}, index + 1);
        } else {
            if(clone instanceof Array) {
                if(this.path[index] === '-') {
                    clone.push(this.value);
                } else {
                    clone.splice(parseInt(this.path[index]), 0, this.value);
                }
            } else {
                clone[this.path[index]] = this.value;
            }
        }
        return clone;
    }
}


class OpRemove extends Op {

    public constructor(src: PatchOperation) {
        super(src);
    }

    public apply(json: any): any {
        return this.applySegment(json, 0);
    }

    private applySegment(json: any, index: number): any {
        let clone = json instanceof Array ? [...json] : {...json};
        if (index + 1 < this.path.length) {
            clone[this.path[index]] = this.applySegment(clone[this.path[index]] || {}, index + 1);
        } else {
            if(clone instanceof Array) {
                clone.splice(parseInt(this.path[index]), 1);
            } else {
                delete clone[this.path[index]];
            }

        }
        return clone;
    }
}

export class Patch {
    private patches: Op[];

    public constructor(src: PatchOperation[]) {
        this.patches = [];
        for (let p of src) {
            switch (p.op) {
                case 'replace':
                    this.patches.push(new OpReplace(p));
                    break;
                case 'add':
                    this.patches.push(new OpAdd(p));
                    break;
                case 'remove':
                    this.patches.push(new OpRemove(p));
                    break;
                case 'copy':
                    this.patches.push(new OpCopy(p));
                    break;
                default:
                    debugger;
            }
        }
    }

    public apply(json: object) {
        for (let patch of this.patches) {
            json = patch.apply(json);
        }
        return json;
    }
}