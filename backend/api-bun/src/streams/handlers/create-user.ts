import { redisGet, redisSet } from '../../services/redis';
import { whatsappManagerClient } from '../../services/whatsapp-manager';

/**
 * Create User handler — creates WhatsApp session via WhatsApp Manager
 */
export async function handleCreateUser(
  data: Record<string, any>,
): Promise<void> {
  const { idUser } = data;

  if (!idUser) {
    throw new Error('idUser is required');
  }

  const sessionId = `user_${idUser}`;

  // Create session in WhatsApp Manager
  console.log(`[CreateUser] Creating session for user ${idUser}...`);
  const session = await whatsappManagerClient.createSession(idUser, sessionId);

  // Store session ID in Redis for later use
  await redisSet(`user:${idUser}:session`, sessionId, 3600 * 24); // 24h TTL

  // Check initial status - if already connected, great! Otherwise need to scan QR
  const status = await whatsappManagerClient.getConnectionStatus(sessionId);
  console.log(`[CreateUser] Session ${sessionId} status: ${status}`);

  if (status === 'connected') {
    console.log(`[CreateUser] User ${idUser} is already connected!`);
  } else {
    console.log(`[CreateUser] Session ${sessionId} needs QR code scan`);
  }
}
