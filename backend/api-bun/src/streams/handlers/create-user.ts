import { redisGet } from '../../services/redis';
import { wuzapiClient } from '../../services/wuzapi';

/**
 * Create User handler — replaces WSS UserCreate processor
 *
 * Creates user in WuzAPI → checks status → starts WhatsApp session
 */
export async function handleCreateUser(
  data: Record<string, any>,
): Promise<void> {
  const { idUser, apiKeyHash } = data;

  // Get API key hash from Redis if not provided
  let userApiKeyHash = apiKeyHash;
  if (!userApiKeyHash) {
    userApiKeyHash = await redisGet(`user:${idUser}:apikey`);
    if (!userApiKeyHash) {
      throw new Error('API key not found for user');
    }
  }

  // Create WuzAPI user if not exists
  await wuzapiClient.createWuzapiUser(idUser, userApiKeyHash);

  // Check if session is already connected
  console.log(`[CreateUser] Checking connection status for user ${idUser}...`);
  const status = await wuzapiClient.getConnectionStatus(
    idUser,
    userApiKeyHash,
  );

  if (status === 'connected') {
    console.log(
      `[CreateUser] User ${idUser} is already connected. Logging out to generate new QR code...`,
    );
    await wuzapiClient.logout(idUser, userApiKeyHash);
    // Wait a bit for logout to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Start WhatsApp session (will generate QR code)
  console.log(`[CreateUser] Starting session for user ${idUser}...`);
  await wuzapiClient.startSession(idUser, userApiKeyHash);

  console.log(`[CreateUser] Session creation initiated for user ${idUser}`);
}
