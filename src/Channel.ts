import { ReverbClient } from "./ReverbClient";
import { EventCallback } from "./types";

export class Channel {
  private listeners = new Map<string, Set<EventCallback>>();
  private subscribed = false;

  constructor(
    private name: string,
    private client: ReverbClient,
  ) {}

  async subscribe() {
    if (this.subscribed) return;

    const isPrivate = this.name.startsWith("private-");
    const isPresence = this.name.startsWith("presence-");

    let authPayload: Record<string, unknown> = {};

    if (isPrivate || isPresence) {
      const socketId = this.client.getSocketId();

      if (!socketId) {
        throw new Error("[Reverb] socket_id not ready yet");
      }

      const auth = await this.client.authorize(socketId, this.name);

      authPayload = {
        auth: auth.auth,
        ...(auth.channel_data ? { channel_data: auth.channel_data } : {}),
      };
    }

    this.client.send({
      event: "pusher:subscribe",
      data: {
        channel: this.name,
        ...authPayload,
      },
    });

    this.subscribed = true;
  }

  listen(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    this.subscribe().catch((err) => {
      console.error("[Reverb] subscribe failed", err);
    });

    return this;
  }

  stopListening(event: string, callback?: EventCallback) {
    if (!this.listeners.has(event)) return this;

    if (callback) {
      this.listeners.get(event)!.delete(callback);
    } else {
      this.listeners.delete(event);
    }

    return this;
  }

  handleEvent(event: string, data: unknown) {
    const callbacks = this.listeners.get(event);

    if (!callbacks) return;

    let parsedData = data;

    if (typeof data === "string") {
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }
    }

    callbacks.forEach((cb) => cb(parsedData));
  }

  getName() {
    return this.name;
  }
}
