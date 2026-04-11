/**
 * WuzAPI HTTP Client — replaces WSS WuzapiClientService
 *
 * Uses native Bun fetch instead of axios/HttpService.
 * Includes retry, circuit breaker, and dynamic timeouts.
 */

const BASE_URL = Bun.env.WUZAPI_BASE_URL || 'http://localhost:8080';
const ADMIN_TOKEN = Bun.env.WUZAPI_ADMIN_TOKEN || '';
const WEBHOOK_URL = Bun.env.WUZAPI_WEBHOOK_URL || '';

const NON_IDEMPOTENT_PATHS = [
  '/chat/send/text',
  '/session/connect',
  '/session/logout',
];

function isNonIdempotent(path: string): boolean {
  return NON_IDEMPOTENT_PATHS.some((p) => path.startsWith(p));
}

const TIMEouts = {
  '/admin/users': 10000,
  '/session/qr': 10000,
  '/session/status': 5000,
  '/chat/send/text': 15000,
  '/session/connect': 30000,
  '/session/logout': 10000,
};

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

const circuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  state: 'CLOSED',
};

const CIRCUIT_THRESHOLD = 5;
const CIRCUIT_RESET_MS = 30000;

function shouldRetry(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('fetch failed') ||
    message.includes('econnrefused') ||
    message.includes('timeout') ||
    message.includes('network')
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function getTimeout(path: string): number {
  for (const [prefix, timeout] of Object.entries(TIMEouts)) {
    if (path.startsWith(prefix)) return timeout;
  }
  return 10000;
}

function checkCircuitBreaker(): boolean {
  const now = Date.now();

  if (circuitBreaker.state === 'OPEN') {
    if (now - circuitBreaker.lastFailure > CIRCUIT_RESET_MS) {
      circuitBreaker.state = 'HALF_OPEN';
      console.log('[CircuitBreaker] HALF_OPEN - testing connection...');
      return true;
    }
    console.log('[CircuitBreaker] OPEN - rejecting request');
    return false;
  }

  return true;
}

function recordSuccess(): void {
  circuitBreaker.failures = 0;
  circuitBreaker.state = 'CLOSED';
}

function recordFailure(): void {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();

  if (circuitBreaker.failures >= CIRCUIT_THRESHOLD) {
    circuitBreaker.state = 'OPEN';
    console.error(`[CircuitBreaker] OPEN - too many failures (${circuitBreaker.failures})`);
  }
}

async function wuzapiFetchWithRetry(
  path: string,
  options: RequestInit & { token?: string; timeout?: number } = {},
  maxRetries = 3,
): Promise<any> {
  if (!checkCircuitBreaker()) {
    throw new Error('Circuit breaker OPEN');
  }

  const timeout = options.timeout || getTimeout(path);
  const { token, timeout: _, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['token'] = token;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        ...fetchOptions,
        headers,
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');

        if (response.status === 409) {
          recordSuccess();
          throw new Error(`409 ${text}`);
        }

        if (response.status >= 500) {
          lastError = new Error(`WuzAPI ${path} failed: ${response.status} ${text}`);
          recordFailure();
          if (attempt < maxRetries - 1 && !isNonIdempotent(path)) {
            const delay = 1000 * Math.pow(2, attempt);
            console.log(`[WuzAPI] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        throw new Error(`WuzAPI ${path} failed: ${response.status} ${text}`);
      }

      recordSuccess();
      return response.json().catch(() => null);
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (shouldRetry(lastError) && attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`[WuzAPI] Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${lastError.message}`);
        await sleep(delay);
      } else {
        recordFailure();
        throw lastError;
      }
    }
  }

  throw lastError;
}

export const wuzapiClient = {
  async createWuzapiUser(userId: string, apiKeyHash: string): Promise<void> {
    try {
      await wuzapiFetchWithRetry('/admin/users', {
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
      if (error instanceof Error && error.message?.includes('409')) {
        console.log(`[WuzAPI] User ${userId} already exists, skipping.`);
        return;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[WuzAPI] Failed to create user ${userId}:`, errorMessage);
      throw error;
    }
  },

  async getUsers(): Promise<any[]> {
    try {
      const response = await wuzapiFetchWithRetry('/admin/users', {
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

  async deleteWuzapiUser(userId: string): Promise<void> {
    try {
      await wuzapiFetchWithRetry(`/admin/users/${userId}`, {
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

  async getQRCode(
    userId: string,
    apiKeyHash: string,
  ): Promise<string | null> {
    try {
      const response = await wuzapiFetchWithRetry('/session/qr', {
        method: 'GET',
        token: apiKeyHash,
      });
      return response?.qrcode || null;
    } catch (error: any) {
      console.error(`[WuzAPI] Failed to get QR code for ${userId}:`, error.message);
      return null;
    }
  },

  async sendMessage(
    userId: string,
    apiKeyHash: string,
    to: string,
    text: string,
  ): Promise<void> {
    try {
      const response = await wuzapiFetchWithRetry('/chat/send/text', {
        method: 'POST',
        token: apiKeyHash,
        body: JSON.stringify({
          Phone: to,
          Body: text,
        }),
      });
      console.log(`[WuzAPI] Message sent for user ${userId} to ${to}. Response:`, JSON.stringify(response));
    } catch (error: any) {
      console.error(`[WuzAPI] Failed to send message for ${userId}:`, error.message);
      throw error;
    }
  },

  async getConnectionStatus(
    userId: string,
    apiKeyHash: string,
  ): Promise<'connected' | 'disconnected'> {
    try {
      const response = await wuzapiFetchWithRetry('/session/status', {
        method: 'GET',
        token: apiKeyHash,
      });
      return response?.connected ? 'connected' : 'disconnected';
    } catch (error: any) {
      console.error(`[WuzAPI] Failed to get status for ${userId}:`, error.message);
      return 'disconnected';
    }
  },

  async logout(userId: string, apiKeyHash: string): Promise<void> {
    try {
      await wuzapiFetchWithRetry('/session/logout', {
        method: 'POST',
        token: apiKeyHash,
      });
      console.log(`[WuzAPI] User ${userId} logged out`);
    } catch (error: any) {
      console.error(`[WuzAPI] Failed to logout ${userId}:`, error.message);
      throw error;
    }
  },

  async startSession(userId: string, apiKeyHash: string): Promise<void> {
    try {
      await wuzapiFetchWithRetry('/session/connect', {
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
      console.log(`[WuzAPI] Session started for user ${userId} with all events subscribed`);
    } catch (error: any) {
      console.error(`[WuzAPI] Failed to start session for ${userId}:`, error.message);
      throw error;
    }
  },

  getCircuitState(): string {
    return circuitBreaker.state;
  },

  isHealthy(): boolean {
    return circuitBreaker.state !== 'OPEN';
  },
};