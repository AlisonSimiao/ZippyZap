import { StreamConsumer } from '../streams/consumer';
import { handleSendMessage } from '../streams/handlers/send-message';
import { handleCreateUser } from '../streams/handlers/create-user';
import { handleSessionLogout } from '../streams/handlers/session-logout';
import { handleWebhook } from '../streams/handlers/webhook';
import { wuzapiClient } from '../services/wuzapi';
import { redisSet } from '../services/redis';
import { prisma } from '../services/prisma';

/**
 * Start all Redis Streams consumers and the status check timer
 */
export async function startWorkers(): Promise<void> {
  console.log('[Workers] Starting Redis Streams consumers...');

  // ─── Send Message Consumer ─────────────────────────────────────
  const sendMessageConsumer = new StreamConsumer(
    'streams:send-message',
    'send-message-workers',
    handleSendMessage,
  );

  // ─── Create User Consumer ──────────────────────────────────────
  const createUserConsumer = new StreamConsumer(
    'streams:create-user',
    'create-user-workers',
    handleCreateUser,
  );

  // ─── Session Logout Consumer ───────────────────────────────────
  const sessionLogoutConsumer = new StreamConsumer(
    'streams:session-logout',
    'session-logout-workers',
    handleSessionLogout,
  );

  // ─── Webhook Consumer ──────────────────────────────────────────
  const webhookConsumer = new StreamConsumer(
    'streams:webhook',
    'webhook-workers',
    handleWebhook,
  );

  // Start all consumers (non-blocking — they run in background loops)
  sendMessageConsumer.start();
  createUserConsumer.start();
  sessionLogoutConsumer.start();
  webhookConsumer.start();

  console.log('[Workers] All 4 stream consumers started');

  // ─── Status Check Timer (replaces WSS StatusCheckProcessor) ────
  const STATUS_CHECK_INTERVAL = 30000; // 30 seconds

  setInterval(async () => {
    try {
      const users = await wuzapiClient.getUsers();

      for (const user of users) {
        try {
          if (user.connected && user.loggedIn) {
            await redisSet(`user:${user.name}:status`, 'connected');
          } else {
            await redisSet(`user:${user.name}:status`, 'disconnected');
          }
        } catch (err) {
          console.error(
            `[StatusCheck] Failed for user ${user.name}:`,
            err,
          );
        }
      }
    } catch (error) {
      console.error('[StatusCheck] Failed to check statuses:', error);
    }
  }, STATUS_CHECK_INTERVAL);

  console.log(
    `[Workers] Status check timer started (every ${STATUS_CHECK_INTERVAL / 1000}s)`,
  );

  // ─── Request Logs Cleanup Job (runs daily) ─────────────────────
  const LOG_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  const LOG_RETENTION_DAYS = 30; // Keep logs for 30 days

  // Run immediately on startup
  await cleanupOldLogs(LOG_RETENTION_DAYS);

  // Then run daily
  setInterval(async () => {
    await cleanupOldLogs(LOG_RETENTION_DAYS);
  }, LOG_CLEANUP_INTERVAL);

  console.log(`[Workers] Log cleanup job scheduled (daily, retaining ${LOG_RETENTION_DAYS} days)`);
}

async function cleanupOldLogs(retentionDays: number): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.requestLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`[LogCleanup] Deleted ${result.count} request logs older than ${retentionDays} days`);
  } catch (error) {
    console.error('[LogCleanup] Failed to delete old logs:', error);
  }
}
