import * as uuid from 'uuid';
import { Client, client, Options, Subscription } from 'webstomp-client';
import { IConnectionStatusListener } from './IConnectionStatusListener';
import { IEventListener } from './IEventListener';
import { SyncConfig } from './SyncConfig';

export default class StompConnection {
    private sessionSubscription: Subscription;
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
        this.sessionToken = uuid.v4();
        this.statusListener = statusListener;
        this.eventListener = eventListener;
        this.onReady = onReady;
        this.statusListener.onDisconnect(0);
        this.pending = [];
    }

    public send(event: object) {
        let msg = JSON.stringify(event);
        try {
            if (this.stompClient) {
                const point = '/app/request/' + this.sessionToken;
                if (this.config.debug) {
                    console.info(`send to: ${point}`)
                }
                this.stompClient.send(point, msg);
            } else {
                console.info(`pending event`);
                this.pending.push(event);
            }
        } catch (err) {
            console.error('error:' + err);
            if (err.name == 'InvalidStateError') {
                this.pending.push(event);
            } else {
                console.log('StompConnection.send failed, reconnect', msg);
                this.disconnect();
            }
        }
    }

    public connect() {
        this.statusListener.onConnecting();
        if (this.config.csrfUrl) {
            var xhttp = new XMLHttpRequest();
            // xhttp.onreadystatechange = (body) => this.wsConnect();
            // xhttp.onerror = () => this.onStompDisconnected();
            xhttp.open("GET", this.config.csrfUrl, false);
            xhttp.send();
            let csrfToken = xhttp.responseText;
            console.info(`wsConnect csrfToken`);
            this.wsConnect(csrfToken);
        } else {
            console.info(`wsConnect`);
            this.wsConnect();
        }
    }

    private wsConnect(csrfToken?: string) {
        let headers: { [key: string]: string; } = {};
        if (csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }
        let url = this.config.url + '?access_token=' + this.config.accessToken;
        console.info(`wsConnect url=${url}`);
        this.stompClient = client(url, <Options>{debug: this.config.debug, protocols:['v12.stomp', 'v11.stomp', 'v10.stomp']});
        this.stompClient.connect(headers, (frame) => this.onStompConnected(frame), (msg: any) => this.onStompDisconnected(msg));
    }

    private onStompConnected(frame: any) {
        if (this.config.debugConnectFrame) console.info(frame);
        this.statusListener.onConnected();
        // this.sessionToken = frame.header;
        let url = '/app/init/' + this.sessionToken;
        console.info(`onStompConnected frame=${frame} url=${url}`);
        this.stompClient.send(url);
        this.onSystemConnected();
    }

    private onStompDisconnected(msg?: any) {
        this.fullyConnected = false;
        this.sessionToken = '';
        this.statusListener.onDisconnect(this.config.timeout);
        this.config.authListener.onAuthRequired('');
    }

    private onSystemConnected() {
        this.statusListener.onConfigured();
        this.sessionSubscription = this.stompClient.subscribe('/out/' + this.sessionToken, (message) => {
            let event = JSON.parse(message.body);
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
        for (let event of this.pending) {
            this.send(event);
        }
        this.pending = [];
    }

    private disconnect() {
        this.stompClient.disconnect(() => {
            console.info('stomp client disconnected');
            this.onStompDisconnected();
        });
    }
}
