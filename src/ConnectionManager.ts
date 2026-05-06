
import type {
  ConnectionState,
  PusherIncomingMessage,
  PusherOutgoingMessage,
  ReverbClientOptions,
} from "./types";

export class ConnectionManager {
  private ws: WebSocket | null = null;
  private state: ConnectionState = "disconnected";

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private manuallyDisconnected = false;

  constructor(
    private options: ReverbClientOptions,
    private onMessage: (msg: PusherIncomingMessage) => void,
  ) {}

  connect() {
    if (this.state === "connecting" || this.state === "connected") return;

    this.manuallyDisconnected = false;
    this.state = "connecting";

    const url = this.buildUrl();
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.state = "connected";
      this.reconnectAttempts = 0;
      console.log("[Reverb] Connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as PusherIncomingMessage;
        this.onMessage(parsed);
      } catch (err) {
        console.warn("[Reverb] Failed to parse message", err);
      }
    };

    this.ws.onerror = (err) => {
      console.warn("[Reverb] WebSocket error", err);
    };

    this.ws.onclose = () => {
      this.ws = null;
      this.state = "disconnected";
      console.log("[Reverb] Disconnected");

      if (!this.manuallyDisconnected) {
        this.reconnect();
      }
    };
  }

  disconnect() {
    this.manuallyDisconnected = true;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.state = "disconnected";
  }

  send(data: PusherOutgoingMessage | object) {
    if (!this.ws || this.state !== "connected") {
      console.warn("[Reverb] Cannot send, socket not connected");
      return;
    }

    this.ws.send(JSON.stringify(data));
  }

  getState() {
    return this.state;
  }

  private buildUrl() {
    const { scheme = "ws", host, port, appKey } = this.options;

    const portPart = port ? `:${port}` : "";

    return `${scheme}://${host}${portPart}/app/${appKey}?protocol=7&client=js&version=1.0&flash=false`;
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("[Reverb] Max reconnect attempts reached");
      return;
    }

    this.state = "reconnecting";
    this.reconnectAttempts++;

    setTimeout(() => {
      console.log("[Reverb] Reconnecting...");
      this.connect();
    }, this.reconnectDelay);
  }
}
