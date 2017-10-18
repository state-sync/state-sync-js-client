import { ISyncAreaStatus, ISyncConnectionStatus, ISyncStatus } from './ISyncStatus';

function connectionStatusReducer(state: ISyncConnectionStatus = {status: 'initialized'}, action: any): ISyncConnectionStatus {
    switch (action.type) {
        case 'CONNECTION_STATUS':
            return {...state, status: action.status};
        default:
            return state;
    }
}

function areasStatusReducer(state: { [id: string]: ISyncAreaStatus } = {}, action: any) {
    switch (action.type) {
        case 'SYNC_AREA_STATUS':
            let tmp = {...state};
            tmp[action.area] = {id: action.area, status};
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