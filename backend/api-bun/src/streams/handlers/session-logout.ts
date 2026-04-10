import { redisGet, redisDel } from '../../services/redis';
import { wuzapiClient } from '../../services/wuzapi';

/**
 * Session Logout handler — replaces WSS SessionLogout processor
 */
export async function handleSessionLogout(
  data: Record<string, any>,
): Promise<void> {
  const { idUser, apiKeyHash } = data;

  // Get API key hash from Redis if not provided
  let userApiKeyHash = apiKeyHash;
  if (!userApiKeyHash) {
    userApiKeyHash = await redisGet(`user:${idUser}:apikey`);
    if (!userApiKeyHash) {
      console.warn(
        `[SessionLogout] API key not found for user ${idUser}, cannot logout from WuzAPI`,
      );
      await cleanupLocalState(idUser);
      return;
    }
  }

  try {
    // Logout from WuzAPI
    await wuzapiClient.logout(idUser, userApiKeyHash);
    await cleanupLocalState(idUser);
    console.log(`[SessionLogout] Session logout completed for user ${idUser}`);
  } catch (error) {
    console.error(`[SessionLogout] Failed to logout session for ${idUser}:`, error);
    // Even on error, try to cleanup local state
    await cleanupLocalState(idUser);
    throw error;
  }
}

async function cleanupLocalState(userId: string): Promise<void> {
  await redisDel(`user:${userId}:status`);
  await redisDel(`user:${userId}:qrcode`);
}
