/**
 * WuzAPI HTTP Client — replaces WSS WuzapiClientService
 *
 * Uses native Bun fetch instead of axios/HttpService.
 */

const BASE_URL = Bun.env.WUZAPI_BASE_URL || 'http://localhost:8082';
const ADMIN_TOKEN = Bun.env.WUZAPI_ADMIN_TOKEN || '';
const WEBHOOK_URL = Bun.env.WUZAPI_WEBHOOK_URL || '';

async function wuzapiFetch(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<any> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['token'] = token;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`WuzAPI ${path} failed: ${response.status} ${text}`);
  }

  return response.json().catch(() => null);
}

export const wuzapiClient = {
  /**
   * Create a user in WuzAPI
   */
  async createWuzapiUser(userId: string, apiKeyHash: string): Promise<void> {
    try {
      await wuzapiFetch('/admin/users', {
        method: 'POST',
        headers: {
          Authorization: ADMIN_TOKEN,
        },
        body: JSON.stringify({
          name: userId,
          token: apiKeyHash,
          webhook: WEBHOOK_URL,
          events: 'All',
        }),
      });
      console.log(`[WuzAPI] User created: ${userId}`);
    } catch (error: any) {
      // 409 = user already exists, that's OK
      if (error.message?.includes('409')) {
        console.log(`[WuzAPI] User ${userId} already exists, skipping.`);
        return;
      }
      console.error(`[WuzAPI] Failed to create user ${userId}:`, error.message);
      throw error;
    }
  },

  /**
   * Get all users from WuzAPI
   */
  async getUsers(): Promise<any[]> {
    try {
      const response = await wuzapiFetch('/admin/users', {
        method: 'GET',
        headers: {
          Authorization: ADMIN_TOKEN,
        },
      });
      return response?.data || [];
    } catch (error: any) {
      console.error('[WuzAPI] Failed to get users:', error.message);
      return [];
    }
  },

  /**
   * Delete a user from WuzAPI
   */
  async deleteWuzapiUser(userId: string): Promise<void> {
    try {
      await wuzapiFetch(`/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: ADMIN_TOKEN,
        },
      });
      console.log(`[WuzAPI] User deleted: ${userId}`);
    } catch (error: any) {
      console.error(`[WuzAPI] Failed to delete user ${userId}:`, error.message);
      throw error;
    }
  },

  /**
   * Get QR code for WhatsApp session
   */
  async getQRCode(
    userId: string,
    apiKeyHash: string,
  ): Promise<string | null> {
    try {
      const response = await wuzapiFetch('/session/qr', {
        method: 'GET',
        token: apiKeyHash,
      });
      return response?.qrcode || null;
    } catch (error: any) {
      console.error(
        `[WuzAPI] Failed to get QR code for ${userId}:`,
        error.message,
      );
      return null;
    }
  },

  /**
   * Send a text message via WuzAPI
   */
  async sendMessage(
    userId: string,
    apiKeyHash: string,
    to: string,
    text: string,
  ): Promise<void> {
    try {
      const response = await wuzapiFetch('/chat/send/text', {
        method: 'POST',
        token: apiKeyHash,
        body: JSON.stringify({
          Phone: to,
          Body: text,
        }),
      });
      console.log(
        `[WuzAPI] Message sent for user ${userId} to ${to}. Response:`,
        JSON.stringify(response),
      );
    } catch (error: any) {
      console.error(
        `[WuzAPI] Failed to send message for ${userId}:`,
        error.message,
      );
      throw error;
    }
  },

  /**
   * Get connection status for a user
   */
  async getConnectionStatus(
    userId: string,
    apiKeyHash: string,
  ): Promise<'connected' | 'disconnected'> {
    try {
      const response = await wuzapiFetch('/session/status', {
        method: 'GET',
        token: apiKeyHash,
      });
      return response?.connected ? 'connected' : 'disconnected';
    } catch (error: any) {
      console.error(
        `[WuzAPI] Failed to get status for ${userId}:`,
        error.message,
      );
      return 'disconnected';
    }
  },

  /**
   * Logout from WhatsApp session
   */
  async logout(userId: string, apiKeyHash: string): Promise<void> {
    try {
      await wuzapiFetch('/session/logout', {
        method: 'POST',
        token: apiKeyHash,
      });
      console.log(`[WuzAPI] User ${userId} logged out`);
    } catch (error: any) {
      console.error(
        `[WuzAPI] Failed to logout ${userId}:`,
        error.message,
      );
      throw error;
    }
  },

  /**
   * Start a WhatsApp session (connect)
   */
  async startSession(userId: string, apiKeyHash: string): Promise<void> {
    try {
      await wuzapiFetch('/session/connect', {
        method: 'POST',
        token: apiKeyHash,
        body: JSON.stringify({
          Subscribe: [
            'Message',
            'ReadReceipt',
            'Presence',
            'ChatPresence',
            'HistorySync',
            'Group',
            'Receipt',
            'UndecryptableMessage',
            'MediaRetry',
            'QR',
            'Status',
            'Connection',
            'Ready',
            'Authenticated',
            'Disconnected',
            'Logout',
            'AuthFailure',
          ],
          Immediate: true,
        }),
      });
      console.log(
        `[WuzAPI] Session started for user ${userId} with all events subscribed`,
      );
    } catch (error: any) {
      console.error(
        `[WuzAPI] Failed to start session for ${userId}:`,
        error.message,
      );
      throw error;
    }
  },
};
