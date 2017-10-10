function isEmpty(obj: object) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export interface Invocation {
    id: number;
    resolve: (value?: number) => void;
    reject: (reason?: any) => void;
}

export class InvocationMap {
    private lastRequestId: number = 0;
    private invocations: { [p: number]: Invocation } = {};
    public timeout: number = 60000;

    public isEmpty(): boolean {
        return isEmpty(this.invocations);
    }

    public request(sender: (id: number) => void): Promise<number> {
        this.lastRequestId++;
        const id = this.lastRequestId;

        const promise = new Promise<number>((resolve, reject) => {
            sender(id);
            let inv = {id: id, resolve: resolve, reject: reject};
            this.invocations[id] = inv;
            setTimeout(() => {
                let p = this.invocations[id];
                if (p) {
                    p.reject('timeout');
                    delete this.invocations[id];
                }
            }, this.timeout);
        });
        return promise;
    }

    public response(forId: number): boolean {
        console.info('response id:'+forId, this.invocations);
        let p = this.invocations[forId];
        if (p) {
            p.resolve(forId);
            delete this.invocations[forId];
        }
        return this.isEmpty();
    }

    public error(forId: number, error: string): boolean {
        let p = this.invocations[forId];
        if (p) {
            p.reject(error);
            delete this.invocations[forId];
        }
        return this.isEmpty();
    }
}