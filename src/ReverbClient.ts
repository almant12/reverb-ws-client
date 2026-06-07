// src/ReverbClient.ts

import { Channel } from "./Channel";
import { ConnectionManager } from "./ConnectionManager";
import type {
  AuthResponse,
  PusherIncomingMessage,
  PusherOutgoingMessage,
  ReverbClientOptions,
} from "./types";

export class ReverbClient {
  private connection: ConnectionManager;
  private channels = new Map<string, Channel>();
  private socketId: string | null = null;

  constructor(private options: ReverbClientOptions) {
    this.connection = new ConnectionManager(
      options,
      this.handleMessage.bind(this),
    );
  }

  connect() {
    this.connection.connect();
  }

  disconnect() {
    this.connection.disconnect();
  }

  channel(name: string) {
    return this.getChannel(name);
  }

  private(name: string) {
    return this.getChannel(`private-${name}`);
  }

  presence(name: string) {
    return this.getChannel(`presence-${name}`);
  }

  send(data: PusherOutgoingMessage | object) {
    this.connection.send(data);
  }

  getSocketId() {
    return this.socketId;
  }

  getOptions() {
    return this.options;
  }

  authorize(socketId: string, channelName: string): Promise<AuthResponse> {
    if (!this.options.authorizer) {
      throw new Error("[Reverb] authorizer is required for private channels");
    }

    return this.options.authorizer({
      socketId,
      channelName,
    });
  }

  private getChannel(name: string) {
    if (!this.channels.has(name)) {
      this.channels.set(name, new Channel(name, this));
    }

    return this.channels.get(name)!;
  }

  private handleMessage(message: PusherIncomingMessage) {
    if (message.event === "pusher:connection_established") {
      const data =
        typeof message.data === "string"
          ? JSON.parse(message.data)
          : message.data;

      this.socketId = data?.socket_id as string;
      return;
    }

    if (message.event === "pusher:ping") {
      this.send({
        event: "pusher:pong",
        data: {},
      });
      return;
    }

    if (message.channel) {
      const channel = this.channels.get(message.channel);
      channel?.handleEvent(message.event, message.data);
    }
  }
}
