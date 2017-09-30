declare module 'jiff' {
    export interface PatchOperation {
        op: string,
        path: string
    }

    /**
     * Compute a JSON Patch representing the differences between a and b.
     * @param a
     * @param b
     * @param {?function|?object} options if a function, see options.hash
     * @param {?function(x:*):String|Number} options.hash used to hash array items
     *  in order to recognize identical objects, defaults to JSON.stringify
     * @param {?function(index:Number, array:Array):object} options.makeContext
     *  used to generate patch context. If not provided, context will not be generated
     * @returns {PatchOperation[]} JSON Patch such that patch(diff(a, b), a) ~ b
     */
    export function diff(a: any, b: any, options?: any): PatchOperation[];
}
