export interface ISyncAuthListener {
    onAuthRequired(message: string) : void;
}