import { redisGet, redisDel } from '../../services/redis';
import { whatsappManagerClient } from '../../services/whatsapp-manager';

/**
 * Session Logout handler — uses WhatsApp Manager service
 */
export async function handleSessionLogout(
  data: Record<string, any>,
): Promise<void> {
  const { idUser } = data;

  if (!idUser) {
    throw new Error('idUser is required');
  }

  const sessionId = `user_${idUser}`;

  try {
    await whatsappManagerClient.logout(sessionId);
    await cleanupLocalState(idUser);
    console.log(`[SessionLogout] Session logout completed for user ${idUser}`);
  } catch (error) {
    console.error(`[SessionLogout] Failed to logout session for ${idUser}:`, error);
    await cleanupLocalState(idUser);
    throw error;
  }
}

async function cleanupLocalState(userId: string): Promise<void> {
  await redisDel(`user:${userId}:status`);
  await redisDel(`user:${userId}:qrcode`);
  await redisDel(`user:${userId}:session`);
}
