/**
 * WhatsApp Manager HTTP Client — replaces WuzAPI client
 *
 * Communicates with the Go-based WhatsApp Manager service (whatsapp-manager)
 * Uses native Bun fetch with retry and circuit breaker.
 */

const BASE_URL = Bun.env.WHATSAPP_MANAGER_URL || 'http://localhost:8090';

const NON_IDEMPOTENT_PATHS = [
  '/sessions',
  '/sessions/:id/send',
];

function isNonIdempotent(path: string): boolean {
  return NON_IDEMPOTENT_PATHS.some((p) => path.startsWith(p.replace('/:id', '')));
}

const TIMEOUTS = {
  '/sessions': 30000,
  '/sessions/:id/status': 5000,
  '/sessions/:id/qr': 10000,
  '/sessions/:id/send': 15000,
  '/sessions/:id/logout': 10000,
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
  for (const [prefix, timeout] of Object.entries(TIMEOUTS)) {
    if (path.startsWith(prefix.replace('/:id', ''))) return timeout;
  }
  return 10000;
}

function checkCircuitBreaker(): boolean {
  const now = Date.now();

  if (circuitBreaker.state === 'OPEN') {
    if (now - circuitBreaker.lastFailure > CIRCUIT_RESET_MS) {
      circuitBreaker.state = 'HALF_OPEN';
      console.log('[WhatsAppManager CircuitBreaker] HALF_OPEN - testing connection...');
      return true;
    }
    console.log('[WhatsAppManager CircuitBreaker] OPEN - rejecting request');
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
    console.error(`[WhatsAppManager CircuitBreaker] OPEN - too many failures (${circuitBreaker.failures})`);
  }
}

async function whatsappManagerFetchWithRetry(
  path: string,
  options: RequestInit & { timeout?: number } = {},
  maxRetries = 3,
): Promise<any> {
  if (!checkCircuitBreaker()) {
    throw new Error('Circuit breaker OPEN');
  }

  const timeout = options.timeout || getTimeout(path);
  const { timeout: _, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

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

        if (response.status >= 500) {
          lastError = new Error(`WhatsAppManager ${path} failed: ${response.status} ${text}`);
          recordFailure();
          if (attempt < maxRetries - 1 && !isNonIdempotent(path)) {
            const delay = 1000 * Math.pow(2, attempt);
            console.log(`[WhatsAppManager] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        throw new Error(`WhatsAppManager ${path} failed: ${response.status} ${text}`);
      }

      recordSuccess();
      return response.json().catch(() => null);
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (shouldRetry(lastError) && attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        console.log(`[WhatsAppManager] Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${lastError.message}`);
        await sleep(delay);
      } else {
        recordFailure();
        throw lastError;
      }
    }
  }

  throw lastError;
}

export interface CreateSessionResponse {
  sessionId: string;
  status: string;
}

export interface QRCodeResponse {
  qr: string;
  expireAt: number;
}

export interface SendMessageResponse {
  messageId: string;
  timestamp: number;
}

export interface ConnectionStatusResponse {
  status: 'connected' | 'disconnected' | 'connecting';
  timestamp: number;
}

export const whatsappManagerClient = {
  async createSession(userId: string, sessionName?: string): Promise<CreateSessionResponse> {
    const response = await whatsappManagerFetchWithRetry('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        name: sessionName || userId,
        userId,
      }),
    });
    console.log(`[WhatsAppManager] Session created: ${response.sessionId}`);
    return response;
  },

  async getQRCode(sessionId: string): Promise<QRCodeResponse | null> {
    try {
      const response = await whatsappManagerFetchWithRetry(`/sessions/${sessionId}/qr`, {
        method: 'GET',
      });
      return response;
    } catch (error: any) {
      console.error(`[WhatsAppManager] Failed to get QR code for ${sessionId}:`, error.message);
      return null;
    }
  },

  async getConnectionStatus(sessionId: string): Promise<'connected' | 'disconnected' | 'connecting'> {
    try {
      const response = await whatsappManagerFetchWithRetry(`/sessions/${sessionId}/status`, {
        method: 'GET',
      });
      return response.status;
    } catch (error: any) {
      console.error(`[WhatsAppManager] Failed to get status for ${sessionId}:`, error.message);
      return 'disconnected';
    }
  },

  async sendMessage(sessionId: string, to: string, text: string): Promise<SendMessageResponse> {
    const response = await whatsappManagerFetchWithRetry(`/sessions/${sessionId}/send`, {
      method: 'POST',
      body: JSON.stringify({
        to,
        text,
      }),
    });
    console.log(`[WhatsAppManager] Message sent for session ${sessionId} to ${to}`);
    return response;
  },

  async logout(sessionId: string): Promise<void> {
    try {
      await whatsappManagerFetchWithRetry(`/sessions/${sessionId}/logout`, {
        method: 'POST',
      });
      console.log(`[WhatsAppManager] Session ${sessionId} logged out`);
    } catch (error: any) {
      console.error(`[WhatsAppManager] Failed to logout ${sessionId}:`, error.message);
      throw error;
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await whatsappManagerFetchWithRetry(`/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      console.log(`[WhatsAppManager] Session ${sessionId} deleted`);
    } catch (error: any) {
      console.error(`[WhatsAppManager] Failed to delete session ${sessionId}:`, error.message);
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