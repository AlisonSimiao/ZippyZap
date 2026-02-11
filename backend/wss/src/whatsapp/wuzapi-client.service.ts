import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

enum EEvent {
  Message = 'Message',
  ReadReceipt = 'ReadReceipt',
  Presence = 'Presence',
  ChatPresence = 'ChatPresence',
  HistorySync = 'HistorySync',
  Receipt = 'Receipt',
  UndecryptableMessage = 'UndecryptableMessage',
  MediaRetry = 'MediaRetry',
  QR = 'QR',
  Disconnected = 'Disconnected',
  All = 'All',
}

export interface WuzapiUser {
  connected?: boolean;
  events?: EEvent;
  expiration?: number;
  id?: string;
  jid?: string;
  loggedIn?: true;
  name?: string;
  proxy_config?: [object];
  proxy_url?: string;
  qrcode?: string;
  s3_config?: [object];
  token?: string;
  webhook?: string;
}

interface WuzapiQRResponse {
  qrcode?: string;
  message?: string;
}

interface WuzapiStatusResponse {
  connected: boolean;
  session?: string;
}

@Injectable()
export class WuzapiClientService {
  private readonly logger = new Logger(WuzapiClientService.name);
  private readonly baseUrl: string;
  private readonly adminToken: string;
  private readonly webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('WUZAPI_BASE_URL') ||
      'http://localhost:8082';
    this.adminToken =
      this.configService.get<string>('WUZAPI_ADMIN_TOKEN') || '';
    this.webhookUrl =
      this.configService.get<string>('WUZAPI_WEBHOOK_URL') || '';

    this.logger.log(
      `WuzAPI Configuration - Base URL: ${this.baseUrl}, Admin Token: ${this.adminToken || 'NOT SET'}`,
    );

    if (!this.baseUrl) {
      throw new Error('WUZAPI_BASE_URL not configured!');
    }

    if (!this.adminToken) {
      throw new Error('WUZAPI_ADMIN_TOKEN not configured!');
    }
  }

  private getAdminAuthHeader(): string {
    return this.adminToken;
  }

  /**
   * Create a user in WuzAPI
   * @param userId - User ID from Zapi (used as WuzAPI user name)
   * @param apiKeyHash - API key hash (used as WuzAPI token)
   */
  async createWuzapiUser(userId: string, apiKeyHash: string): Promise<void> {
    try {
      const userData: WuzapiUser = {
        name: userId,
        token: apiKeyHash,
        webhook: this.webhookUrl,
        events: EEvent.All,
      };

      const res = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/admin/users`, userData, {
          headers: {
            Authorization: this.getAdminAuthHeader(),
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );
      void res;
      this.logger.log(`WuzAPI user created: ${userId}`);
    } catch (error: any) {
      if (
        error.response?.status === 409 ||
        error.response?.data?.code === 409
      ) {
        this.logger.warn(
          `User ${userId} already exists in WuzAPI, skipping creation.`,
        );
        return;
      }
      this.logger.error(
        `Failed to create WuzAPI user ${userId}:`,
        error?.response?.data || error?.message || error,
      );
      throw error;
    }
  }

  /**
   * Get all users from WuzAPI
   */
  async getUsers(): Promise<WuzapiUser[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: WuzapiUser[] }>(
          `${this.baseUrl}/admin/users`,
          {
            headers: {
              Authorization: this.getAdminAuthHeader(),
            },
            timeout: 10000,
          },
        ),
      );

      return response.data?.data || [];
    } catch (error: any) {
      this.logger.error(
        `Failed to get users:`,
        error?.response?.data || error?.message || error,
      );
      return [];
    }
  }

  /**
   * Delete a user from WuzAPI
   * @param userId - User ID to delete
   */
  async deleteWuzapiUser(userId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/admin/users/${userId}`, {
          headers: {
            Authorization: this.getAdminAuthHeader(),
          },
          timeout: 10000,
        }),
      );

      this.logger.log(`WuzAPI user deleted: ${userId}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to delete WuzAPI user ${userId}:`,
        error?.response?.data || error?.message || error,
      );
      throw error;
    }
  }

  /**
   * Get QR code for WhatsApp session
   * @param userId - User ID
   * @param apiKeyHash - User's API key hash (token)
   */
  async getQRCode(userId: string, apiKeyHash: string): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<WuzapiQRResponse>(`${this.baseUrl}/session/qr`, {
          headers: {
            token: apiKeyHash,
          },
          timeout: 10000,
        }),
      );

      return response.data.qrcode || null;
    } catch (error: any) {
      this.logger.error(
        `Failed to get QR code for ${userId}:`,
        error?.response?.data || error?.message || error,
      );
      return null;
    }
  }

  /**
   * Send a text message via WuzAPI
   * @param userId - User ID
   * @param apiKeyHash - User's API key hash (token)
   * @param to - Recipient phone number
   * @param text - Message text
   */
  async sendMessage(
    userId: string,
    apiKeyHash: string,
    to: string,
    text: string,
  ): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/chat/send/text`,
          {
            Phone: to,
            Body: text,
          },
          {
            headers: {
              token: apiKeyHash,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(
        `Message sent via WuzAPI for user ${userId} to ${to}. Response: ${JSON.stringify(response.data)}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send message for ${userId}:`,
        error?.response?.data || error?.message || error,
      );
      throw error;
    }
  }

  /**
   * Get connection status for a user
   * @param userId - User ID
   * @param apiKeyHash - User's API key hash (token)
   */
  async getConnectionStatus(
    userId: string,
    apiKeyHash: string,
  ): Promise<'connected' | 'disconnected'> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<WuzapiStatusResponse>(
          `${this.baseUrl}/session/status`,
          {
            headers: {
              token: apiKeyHash,
            },
            timeout: 10000,
          },
        ),
      );

      return response.data.connected ? 'connected' : 'disconnected';
    } catch (error: any) {
      this.logger.error(
        `Failed to get status for ${userId}:`,
        error?.response?.data || error?.message || error,
      );
      return 'disconnected';
    }
  }

  /**
   * Logout from WhatsApp session
   * @param userId - User ID
   * @param apiKeyHash - User's API key hash (token)
   */
  async logout(userId: string, apiKeyHash: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/session/logout`,
          {},
          {
            headers: {
              token: apiKeyHash,
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(`User ${userId} logged out from WuzAPI`);
    } catch (error: any) {
      this.logger.error(
        `Failed to logout ${userId}:`,
        error?.response?.data || error?.message || error,
      );
      throw error;
    }
  }

  /**
   * Start a WhatsApp session (connect)
   * @param userId - User ID
   * @param apiKeyHash - User's API key hash (token)
   */
  async startSession(userId: string, apiKeyHash: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/session/connect`,
          {
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

              // 🔥 eventos de status que estavam faltando
              'Status',
              'Connection',
              'Ready',
              'Authenticated',
              'Disconnected',
              'Logout',
              'AuthFailure',
            ],

            Immediate: true,
          },
          {
            headers: {
              token: apiKeyHash,
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(
        `Session started for user ${userId} with all events subscribed`,
      );
    } catch (error) {
      const response = error['response']?.data || error?.message || error;

      this.logger.error(`Failed to start session for ${userId}:`, response);
      throw error;
    }
  }
}
