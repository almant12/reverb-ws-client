import "dotenv/config";
import { describe, it, expect } from "vitest";
import { ReverbClient } from "../../src/ReverbClient";

describe("Laravel Reverb integration", () => {
  it("connects and receives realtime event", async () => {
    const reverb = new ReverbClient({
      appKey: process.env.REVERB_APP_KEY!,
      host: process.env.REVERB_HOST!,
      port: Number(process.env.REVERB_PORT ?? 8080),
      scheme: "ws",

      authorizer: async ({ socketId, channelName }) => {
        const response = await fetch(process.env.REVERB_AUTH_URL!, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.API_TOKEN}`,
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channelName,
          }),
        });

        if (!response.ok) {
          throw new Error(`Auth failed: ${response.status}`);
        }

        return response.json();
      },
    });

    await reverb.connect();

    const received = new Promise((resolve) => {
      reverb.private("tables").listen("table.lock", (data) => {
        resolve(data);
      });
    });

    /**
     * IMPORTANT:
     * Trigger this event from Laravel while the test is running.
     *
     * Example:
     * event(new TableLock($set));
     */

    const data = await received;

    expect(data).toBeDefined();

    reverb.disconnect();
  }, 30_000);
});
