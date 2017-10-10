import { Client, client, Options, Subscription } from 'webstomp-client';
import { IConnectionStatusListener } from './IConnectionStatusListener';
import { IEventListener } from './IEventListener';
import { SyncConfig } from './SyncConfig';

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
    private onReady: () => any;
    private fullyConnected: boolean;
    private pending: object[];

    public constructor(config: SyncConfig, statusListener: IConnectionStatusListener, eventListener: IEventListener, onReady: () => any) {
        this.config = config;
        this.statusListener = statusListener;
        this.eventListener = eventListener;
        this.onReady = onReady;
        this.statusListener.onDisconnect();
        this.pending = [];
    }

    public send(event: object) {
        let msg = JSON.stringify(event);
        try {
            if(this.stompClient) {
                this.stompClient.send('/session/' + this.sessionToken, msg);
            } else {
                this.pending.push(event);
            }
        } catch (err) {
            if(err.name == 'InvalidStateError') {
                this.pending.push(event);
            } else {
                console.log('StompConnection.send failed, reconnect', msg);
                this.disconnect();
            }
        }
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
        this.fullyConnected = false;
        this.statusListener.onDisconnect();
        setTimeout(() => this.connect(), this.config.timeout);
    }

    private onSystemConnected() {
        this.statusListener.onConfigured();
        this.userSubscription = this.stompClient.subscribe('/account/' + this.userToken, (message) => {
            let event = JSON.parse(message.body);
            event.channel = 'user';
            this.eventListener.onEvent(event);
        });
        this.sessionSubscription = this.stompClient.subscribe('/session/' + this.sessionToken, (message) => {
            let event = JSON.parse(message.body);
            event.channel = 'session';
            this.eventListener.onEvent(event);
            this.onSessionChannelConnected();
        });
        this.fullyConnected = true;
        this.statusListener.onReady();
        this.onReady();
    }

    isFullyConnected() {
        return this.fullyConnected;
    }

    private onSessionChannelConnected() {
        for(let event of this.pending) {
            this.send(event);
        }
        this.pending = [];
    }

    private disconnect() {
        this.stompClient.disconnect(() => {
            console.info('stomp client disconnected');
        });
        this.connect();
    }
}
