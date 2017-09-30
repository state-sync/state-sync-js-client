function purify(obj: any) {
    return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
}

export default purify;