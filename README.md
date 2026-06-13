# reverb-ws-client

A lightweight WebSocket client for Laravel Reverb with support for:

- Public channels
- Private channels
- Presence channels
- Automatic reconnection
- TypeScript support
- Custom authorization
- Browser and React Native support

## Installation

```bash
npm install reverb-ws-client
```

## Quick Start

```ts
import { ReverbClient } from "reverb-ws-client";

const client = new ReverbClient({
  appKey: "your-app-key",
  host: "localhost",
  port: 8080,
  scheme: "ws",
});

await client.connect();

const channel = client.channel("chat");

channel.listen("MessageSent", (data) => {
  console.log(data);
});
```

## Configuration

```ts
import { ReverbClient } from "reverb-ws-client";

const client = new ReverbClient({
  appKey: "your-app-key",
  host: "localhost",
  port: 8080,
  scheme: "ws",
  debug: true,

  // Required for private and presence channels
  authorizer: async (channelName, socketId) => {
    const response = await fetch("http://localhost:8000/broadcasting/auth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        socket_id: socketId,
        channel_name: channelName,
      }),
    });

    return response.json();
  },
});
```

## Configuration Options

| Option     | Type          | Required | Description                            |
| ---------- | ------------- | -------- | -------------------------------------- |
| appKey     | string        | Yes      | Laravel Reverb application key         |
| host       | string        | Yes      | Reverb server host                     |
| port       | number        | Yes      | Reverb server port                     |
| scheme     | `ws` \| `wss` | No       | Connection protocol                    |
| debug      | boolean       | No       | Enable debug logging                   |
| authorizer | function      | No       | Used for private and presence channels |

## Public Channels

```ts
const channel = client.channel("chat");

channel.listen("MessageSent", (event) => {
  console.log(event);
});
```

## Private Channels

```ts
const channel = await client.private("private-chat");

channel.listen("MessageSent", (event) => {
  console.log(event);
});
```

## Presence Channels

```ts
const channel = await client.presence("chat-room");

channel.listen("MessageSent", (event) => {
  console.log(event);
});
```

## Stop Listening

```ts
channel.stopListening("MessageSent");
```

## Unsubscribe

```ts
channel.unsubscribe();
```

## Disconnect

```ts
client.disconnect();
```

## Laravel Reverb Example

### Backend Event

```php
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class MessageSent implements ShouldBroadcast
{
    public function broadcastOn(): array
    {
        return [
            new Channel('chat'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}
```

### Frontend Listener

```ts
const channel = client.channel("chat");

channel.listen("MessageSent", (data) => {
  console.log(data);
});
```

## Features

- Lightweight and dependency-free
- Laravel Reverb compatible
- Automatic reconnection
- Public channels
- Private channels
- Presence channels
- TypeScript support
- React Native support
- Custom authentication flow

## License

MIT
