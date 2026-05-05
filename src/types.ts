export type ReverbScheme = "ws" | "wss";

export type ChannelType = "public" | "private" | "presence";

export type EventCallback<T = unknown> = (data: T) => void;

export type GetTokenFunction = () => string | Promise<string>;

export type ReverbClientOptions = {
  appKey: string;
  host: string;
  port?: number;
  scheme?: ReverbScheme;
  authorizer?: Authorizer;
};

export type PusherIncomingMessage = {
  event: string;
  data?: string | Record<string, unknown>;
  channel?: string;
};

export type PusherOutgoingMessage = {
  event: string;
  data?: Record<string, unknown>;
  channel?: string;
};

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export type AuthResponse = {
  auth: string;
  channel_data?: string;
};

export type Authorizer = (params: {
  socketId: string;
  channelName: string;
}) => Promise<AuthResponse>;
