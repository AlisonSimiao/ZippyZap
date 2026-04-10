import { redisGet } from '../../services/redis';
import { wuzapiClient } from '../../services/wuzapi';

/**
 * Send Message handler — replaces WSS SendMessage processor
 */
export async function handleSendMessage(
  data: Record<string, any>,
): Promise<void> {
  const { idUser, telefone, text, apiKeyHash } = data;

  // Get API key hash from Redis if not provided
  let userApiKeyHash = apiKeyHash;
  if (!userApiKeyHash) {
    userApiKeyHash = await redisGet(`user:${idUser}:apikey`);
    if (!userApiKeyHash) {
      throw new Error('API key not found for user');
    }
  }

  await wuzapiClient.sendMessage(idUser, userApiKeyHash, telefone, text);
  console.log(`[SendMessage] Message sent for user ${idUser} to ${telefone}`);
}
