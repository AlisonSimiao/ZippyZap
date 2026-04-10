import { redis } from '../services/redis';

/**
 * Redis Streams consumer — replaces BullMQ Worker
 *
 * Uses XREADGROUP for blocking reads and XACK for acknowledgment.
 */
export class StreamConsumer {
  private group: string;
  private stream: string;
  private consumerId: string;
  private handler: (data: Record<string, any>) => Promise<void>;
  private running = false;

  constructor(
    stream: string,
    group: string,
    handler: (data: Record<string, any>) => Promise<void>,
  ) {
    this.stream = stream;
    this.group = group;
    this.consumerId = `consumer-${process.pid}-${Date.now()}`;
    this.handler = handler;
  }

  async start(): Promise<void> {
    // Ensure consumer group exists
    try {
      await redis.xgroup('CREATE', this.stream, this.group, '0', 'MKSTREAM');
    } catch (err: any) {
      // Group already exists — that's fine
      if (!err.message?.includes('BUSYGROUP')) {
        throw err;
      }
    }

    this.running = true;
    console.log(`[Consumer] Listening on ${this.stream}:${this.group}`);

    while (this.running) {
      try {
        const messages = await redis.xreadgroup(
          'GROUP',
          this.group,
          this.consumerId,
          'COUNT',
          '10',
          'BLOCK',
          '5000',
          'STREAMS',
          this.stream,
          '>',
        );

        if (!messages) continue;

        for (const [, entries] of messages as any) {
          for (const [id, fields] of entries as any) {
            // Parse the serialized data field
            let data: Record<string, any> = {};

            // Our producer stores everything in a single 'data' JSON field
            const fieldsArr = fields as string[];
            for (let i = 0; i < fieldsArr.length; i += 2) {
              if (fieldsArr[i] === 'data') {
                try {
                  data = JSON.parse(fieldsArr[i + 1]);
                } catch {
                  data = { raw: fieldsArr[i + 1] };
                }
              }
            }

            try {
              await this.handler(data);
              await redis.xack(this.stream, this.group, id as string);
            } catch (error) {
              console.error(
                `[Consumer] Error processing ${id} on ${this.stream}:`,
                error,
              );
              // Message stays pending — can be retried or moved to DLQ
            }
          }
        }
      } catch (error) {
        if (this.running) {
          console.error(`[Consumer] Loop error on ${this.stream}:`, error);
          // Wait a bit before retrying
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
  }

  stop(): void {
    this.running = false;
    console.log(`[Consumer] Stopped ${this.stream}:${this.group}`);
  }
}
