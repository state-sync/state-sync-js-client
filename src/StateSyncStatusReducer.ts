function connectionStatusReducer(state = 'initialized', action: any) {
    switch (action.__stateSyncEvent__) {
        case 'CONNECTION_STATUS':
            return action.status;
        default:
            return state;
    }
}

function areasStatusReducer(state = {}, action: any) {
    switch (action.__stateSyncEvent__) {
        case 'SYNC_AREA_STATUS':
            let t = <any>{...state};
            t[action.area] = action.status;
            return t;
        default:
            return state;
    }
}

function StateSyncStatusReducer(state: any, action: any) {
    return {
        connection: connectionStatusReducer(state, action),
        areas: areasStatusReducer(state, action)
    }
}

export default StateSyncStatusReducer;