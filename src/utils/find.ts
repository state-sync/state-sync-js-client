function parse(pathStr: string) {
    let i, split, path = [];
    // Split up the path
    split = pathStr.split('/');
    if ('' !== split[0]) {
        throw new Error('');
    }
    for (i = 1; i < split.length; i++) {
        path[i - 1] = split[i].replace(/~1/g, '/').replace(/~0/g, '~');
    }
    return path;
}

function find(ctx: any, path: string) {
    for (let seg in parse(path)) {
        if (ctx === null) {
            return null;
        } else if (ctx instanceof Array) {
            ctx = ctx[parseInt(seg)];
        } else if (ctx instanceof Object) {
            ctx = ctx[seg];
        }
    }
    return ctx;
}

export default find;