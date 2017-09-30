import StompConnection from "./StompConnection";
import SyncService from "./SyncService";

export type StompConnection = StompConnection;
export type SyncService = SyncService;

const StatSync = new SyncService();

export default StatSync;