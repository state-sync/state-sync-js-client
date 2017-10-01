export interface ISyncArea {
    /**
     * Replace value in area state
     * @param {string} path path to value
     * @param value new value
     */
    actionReplace(path: string, value: any): void;

    /**
     * Toggle value in area state
     * @param {string} path
     */
    actionToggle(path: string) : void;
}