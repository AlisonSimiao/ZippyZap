import { redis } from '../services/redis';

/**
 * Redis Streams producer — replaces BullMQ Queue.add()
 *
 * Adds messages to Redis Streams using XADD.
 * Supports delayed jobs via sorted sets.
 */
export async function addJob(
  stream: string,
  data: Record<string, unknown>,
  options?: { delay?: number },
): Promise<string> {
  const serialized = JSON.stringify(data);

  if (options?.delay) {
    // Delayed job: add to sorted set, will be moved to stream later
    const delayedKey = `delayed:${stream}`;
    await redis.zadd(
      delayedKey,
      Date.now() + options.delay,
      serialized,
    );
    return 'delayed';
  }

  // Normal job: XADD to stream
  const id = await redis.xadd(stream, '*', 'data', serialized);
  return id || '';
}

/**
 * Process delayed jobs — move expired jobs from sorted set to stream
 */
export async function processDelayedJobs(stream: string): Promise<number> {
  const delayedKey = `delayed:${stream}`;
  const now = Date.now();
  const jobs = await redis.zrangebyscore(delayedKey, 0, now);

  for (const job of jobs) {
    await redis.xadd(stream, '*', 'data', job);
    await redis.zrem(delayedKey, job);
  }

  return jobs.length;
}
