// ─── HTTP Error Classes ────────────────────────────────────────────

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

export class BadRequestException extends HttpError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedException extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundException extends HttpError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictException extends HttpError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class UnprocessableEntityException extends HttpError {
  constructor(message = 'Unprocessable Entity') {
    super(message, 422);
  }
}

export class TooManyRequestsException extends HttpError {
  constructor(message = 'Too Many Requests') {
    super(message, 429);
  }
}

// ─── JWT Payload ───────────────────────────────────────────────────

export interface JwtPayload {
  id: number;
}

// ─── API Key Context ───────────────────────────────────────────────

export interface ApiKeyContext {
  id: number;
  userId: number;
  User: {
    Plan: {
      dailyLimit: number;
      monthlyLimit: number;
      sessionLimit: number;
      name: string;
    };
  };
}

// ─── Webhook Job Types (migrated from webhook-job.types.ts) ────────

export interface IWebhookJob {
  idUser: string;
  type: string;
  data: Record<string, any>;
  [key: string]: any;
}

export interface QRWebhookJob {
  idUser: string;
  type: 'QR';
  data: {
    qr: string;
    expireAt: number;
  };
}

// ─── WuzAPI Webhook Payload ────────────────────────────────────────

export interface WuzapiWebhookPayload<T = any> {
  instanceName: string;
  event: T;
  jsonData: string;
  type: string;
  userID: string;
}

// ─── WhatsApp Manager Webhook Payload ───────────────────────────────

export interface WhatsAppManagerWebhookPayload {
  event: 'connected' | 'disconnected' | 'qr' | 'message.received' | 'message.sent' | 'message.receipt';
  sessionId: string;
  data: Record<string, any>;
}
