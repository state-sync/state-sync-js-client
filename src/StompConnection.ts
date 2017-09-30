import { Client, client, Options, Subscription } from 'webstomp-client';
import { IEventListener } from "./IEventListener";
import { IStatusListener } from "./IStatusListener";

export class StompConnection {
    private sessionSubscription: Subscription;
    private userSubscription: Subscription;
    private userToken: any;
    private rootSubscription: Subscription;
    private sessionToken: string;
    private statusListener: IStatusListener;
    private eventListener: IEventListener;
    private config: { timeout: number; debug: boolean; };
    private url: string;
    private stompClient: Client;

    public constructor(url: string, statusListener: IStatusListener, eventListener: IEventListener, config = {
        timeout: 5000,
        debug: false
    }) {
        this.config = config;
        this.url = url;
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
        this.stompClient = client(this.url, <Options>{debug: this.config.debug});
        this.stompClient.connect({}, (frame) => this.onStompConnected(frame), () => this.onStompDisconnected());
    }

    private onStompConnected(frame: any) {
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
            this.eventListener.onUserEvent(event);
        });
        this.sessionSubscription = this.stompClient.subscribe('/session/' + this.sessionToken, (message) => {
            let event = JSON.parse(message.body);
            this.eventListener.onSessionEvent(event);
        });
    }

}