export interface ISyncAreaStatus {
    id: string;
    status: string;
}
export interface ISyncConnectionStatus {
    status: string;
    reconnectTimeout?: number;
}

export interface ISyncStatus{
    connection: ISyncConnectionStatus;
    areas: { [id:string]: ISyncAreaStatus}
}
