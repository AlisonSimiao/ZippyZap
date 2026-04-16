import { redisGet } from '../../services/redis';
import { whatsappManagerClient } from '../../services/whatsapp-manager';

/**
 * Send Message handler — uses WhatsApp Manager service
 */
export async function handleSendMessage(
  data: Record<string, any>,
): Promise<void> {
  const { sessionId, telefone, text, apiKeyHash } = data;

  if (!sessionId) {
    throw new Error('sessionId is required');
  }

  await whatsappManagerClient.sendMessage(sessionId, telefone, text);
  console.log(`[SendMessage] Message sent for session ${sessionId} to ${telefone}`);
}
