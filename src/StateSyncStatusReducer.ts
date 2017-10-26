import { ISyncAreaStatus, ISyncConnectionStatus, ISyncStatus } from './ISyncStatus';

function connectionStatusReducer(state: ISyncConnectionStatus = {status: 'initialized'}, action: any): ISyncConnectionStatus {
    switch (action.type) {
        case '@STATE_SYNC/CONNECTION_STATUS':
            return action.payload;
        case '@STATE_SYNC/CONNECTION_STATUS_TICK':
            return state.status === 'disconnected' ?
                {status: 'disconnected', reconnectTimeout: state.reconnectTimeout ? state.reconnectTimeout - 1000 : 0}
                : state;
        default:
            return state;
    }
}

function areasStatusReducer(state: { [id: string]: ISyncAreaStatus } = {}, action: any): { [id: string]: ISyncAreaStatus } {
    switch (action.type) {
        case '@STATE_SYNC/SYNC_AREA_STATUS':
            let st: ISyncAreaStatus = {id: action.area, status: action.status, ready: action.ready};
            let tmp = {...state};
            tmp[action.area] = st;
            return tmp;
        default:
            return state;
    }
}

function StateSyncStatusReducer(state: ISyncStatus = {
    connection: {status: 'initialized'},
    areas: {}
}, action: any): ISyncStatus {
    return {
        connection: connectionStatusReducer(state.connection, action),
        areas: areasStatusReducer(state.areas, action)
    }
}

export default StateSyncStatusReducer;