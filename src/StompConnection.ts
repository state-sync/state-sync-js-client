import { Client, client, Options, Subscription } from 'webstomp-client';
import { IEventListener } from "./IEventListener";
import { IConnectionStatusListener } from "./IConnectionStatusListener";
import SyncConfig from './SyncConfig';

export default class StompConnection {
    private sessionSubscription: Subscription;
    private userSubscription: Subscription;
    private userToken: any;
    private rootSubscription: Subscription;
    private sessionToken: string;
    public statusListener: IConnectionStatusListener;
    private eventListener: IEventListener;
    private config: SyncConfig;
    private stompClient: Client;

    public constructor(config: SyncConfig, statusListener: IConnectionStatusListener, eventListener: IEventListener) {
        this.config = config;
        this.statusListener = statusListener;
        this.eventListener = eventListener;
        this.statusListener.onDisconnect();
    }

    public send(event: object) {
        let msg = JSON.stringify(event);
        this.stompClient.send('/session/' + this.sessionToken, msg);
    }

    public connect() {
        this.statusListener.onConnecting();
        this.stompClient = client(this.config.url, <Options>{debug: this.config.debug});
        this.stompClient.connect({}, (frame) => this.onStompConnected(frame), () => this.onStompDisconnected());
    }

    private onStompConnected(frame: any) {
        if (this.config.debugConnectFrame) console.info(frame);
        this.statusListener.onConnected();
        this.rootSubscription = this.stompClient.subscribe('/root', (message) => {
            let event = JSON.parse(message.body);
            this.userToken = event.userToken;
            this.sessionToken = event.sessionToken;
            this.onSystemConnected();
        });
    }

    private onStompDisconnected() {
        this.statusListener.onDisconnect();
        setTimeout(() => this.connect(), this.config.timeout);
    }

    private onSystemConnected() {
        this.statusListener.onConfigured();
        this.userSubscription = this.stompClient.subscribe('/user/' + this.userToken, (message) => {
            let event = JSON.parse(message.body);
            event.channel = 'user';
            this.eventListener.onEvent(event);
        });
        this.sessionSubscription = this.stompClient.subscribe('/session/' + this.sessionToken, (message) => {
            let event = JSON.parse(message.body);
            event.channel = 'session';
            this.eventListener.onEvent(event);
        });
    }

}