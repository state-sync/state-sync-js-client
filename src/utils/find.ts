/**
 * Parse JSON path and return array of segments
 * @param {string} pathStr
 * @returns {Array} array of segments
 */
function parse(pathStr: string) {
    //TODO: optimize by indexOf loop
    let split, path = [];
    // Split up the path
    split = pathStr.split('/');
    return split.splice(1);
}

/**
 * Find and return value by path, if path is not available in provided context, returns null
 * @param model
 * @param {string} path path to value
 * @returns {any} value or null
 */
function find(model: any, path: string) {
    for (let seg of parse(path)) {
        if (model === null) {
            return null;
        } else if (model instanceof Array) {
            model = model[parseInt(seg)];
        } else if (model instanceof Object) {
            model = model[seg];
        } else {
            model = null;
        }
    }
    return model;
}

export default find;