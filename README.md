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

# Configuration

```bash
import { ReverbClient } from "reverb-ws-client"; const client = new ReverbClient({ appKey: "your-app-key", host: "localhost", port: 8080, scheme: "ws", debug: true, // Required for private and presence channels authorizer: async (channelName, socketId) => { const response = await fetch( "http://localhost:8000/broadcasting/auth", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", }, body: JSON.stringify({ socket_id: socketId, channel_name: channelName, }), } ); return response.json(); }, });
```
