import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from 'src/redis/redis.service';
import * as wppconnect from '@wppconnect-team/wppconnect';

enum EStatusConnction {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private sessions = new Map<string, wppconnect.Whatsapp>();
  private sessionListeners = new Map<string, Function[]>();
  private messageCooldown = new Map<string, number>();
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    sessionsCreated: 0,
    errors: 0
  };
  private logger = new Logger('WhatsappService');

  constructor(
    @InjectQueue('create-user') private readonly createUserQueue: Queue,
    private redisService: RedisService,
  ) { }

  async onModuleInit() {
    this.sessions = new Map<string, wppconnect.Whatsapp>();

    // Restore sessions for users marked as connected in Redis
    try {
      const connectedKeys = await this.redisService.keys('user:*:status');

      for (const key of connectedKeys) {
        const status = await this.redisService.get(key);
        if (status === EStatusConnction.CONNECTED) {
          const idUser = key.split(':')[1];
          if (idUser && !this.sessions.has(idUser)) {
            this.logger.log(`Restaurando sessão para usuário ${idUser}...`);
            await this.createUserQueue.add('create-user', {
              idUser
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Erro ao restaurar sessões:', error);
    }
  }

  async onModuleDestroy() {
    for (const idUser of this.sessions.keys()) {
      await this.destroySession(idUser);
    }
  }

  async createSession(idUser: string) {
    if (!idUser) throw new Error('Tentativa de criar sessão com ID inválido');

    if (this.sessions.get(idUser)) return;

    try {
      const client = await wppconnect.create({
        session: idUser,
        catchQR: (base64Qr, asciiQR) => {
          this.logger.log(`QR Code gerado para ${idUser}`);
          console.log(asciiQR);

          this.redisService.set(
            `user:${idUser}:qrcode`,
            JSON.stringify({ qr: base64Qr, expireAt: Date.now() + 60000 }),
          );
        },
        statusFind: (statusSession, session) => {
          this.logger.log(`Status Session: ${statusSession}`);
          this.redisService.set(`user:${idUser}:status`, statusSession);

          if (statusSession === 'inChat' || statusSession === 'isLogged') {
            this.redisService.set(`user:${idUser}:status`, EStatusConnction.CONNECTED);
          }
        },
        folderNameToken: 'tokens',
        headless: true,
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: false,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-sync',
        ],
        disableWelcome: true,
        updatesLog: false,
        autoClose: 0,
      });

      this.sessions.set(idUser, client);
      this.metrics.sessionsCreated++;

      this.registerListeners(idUser, client);

    } catch (error) {
      this.logger.error(`Erro ao criar sessão para ${idUser}:`, error);
      this.metrics.errors++;
      throw error;
    }
  }

  private registerListeners(idUser: string, client: wppconnect.Whatsapp) {
    // Message Listener
    const messageListener = async (msg: wppconnect.Message) => {
      this.metrics.messagesReceived++;
      await this.createUserQueue.add('process-message', {
        sessionId: idUser,
        message: msg
      }, {
        removeOnComplete: true,
        attempts: 3
      });
    };

    // State Change Listener
    const stateListener = (state: string) => {
      this.logger.log(`State changed: ${state}`);
      if (state === 'CONFLICT' || state === 'UNPAIRED' || state === 'UNLAUNCHED') {
        this.logger.warn(`Sessão desconectada/conflito: ${state}`);
        this.handleReconnection(idUser);
      }
    };

    client.onMessage(messageListener);
    client.onStateChange(stateListener);

    // Store cleanup functions
    this.sessionListeners.set(idUser, [
     messageListener,
     stateListener
    ]);
  }

  private cleanupSession(idUser: string, client: wppconnect.Whatsapp) {
    const listeners = this.sessionListeners.get(idUser);
    if (listeners) {
      listeners.forEach(cleanup => cleanup());
      this.sessionListeners.delete(idUser);
    }
  }

  async destroySession(idUser: string) {
    const client = this.sessions.get(idUser);
    if (client) {
      this.cleanupSession(idUser, client);
      try {
        await client.close();
        await client.logout();
      } catch (error) {
        this.logger.warn(`Erro ao destruir sessão ${idUser}:`, error);
      }
      this.sessions.delete(idUser);
      await this.redisService.del(`user:${idUser}:status`);
      await this.redisService.del(`user:${idUser}:qrcode`);
    }
  }

  private async handleReconnection(idUser: string) {
    this.logger.warn(`Iniciando processo de reconexão para ${idUser}...`);

    try {
      await this.destroySession(idUser);
      this.logger.log(`Sessão ${idUser} destruída. Enfileirando recriação...`);

      await this.createUserQueue.add('create-user', {
        idUser
      }, { jobId: `create-user-${idUser}`, removeOnComplete: true });
    } catch (error) {
      this.logger.error(`Erro ao processar reconexão para ${idUser}:`, error);
    }
  }

  private validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[1-9]{2}9[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  async sendMessage(idUser: string, phone: string, text: string) {
    const client = this.sessions.get(idUser);
    if (!client) {
      throw new Error(`Sessão não encontrada para o usuário ${idUser}`);
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Mensagem não pode estar vazia');
    }

    if (text.length > 4096) {
      throw new Error('Mensagem muito longa (max 4096 caracteres)');
    }

    const cooldownKey = `${idUser}:${phone}`;
    const lastSent = this.messageCooldown.get(cooldownKey) || 0;

    if (Date.now() - lastSent < 1000) {
      throw new Error('Rate limit exceeded. Wait 1 second between messages.');
    }

    const chatId = `${phone}@c.us`;
    await client.sendText(chatId, text);

    this.messageCooldown.set(cooldownKey, Date.now());
    this.metrics.messagesSent++;
  }

  async getSessionHealth(idUser: string): Promise<{ status: string; lastSeen: Date | null }> {
    const client = this.sessions.get(idUser);
    if (!client) return { status: 'DISCONNECTED', lastSeen: null };

    const isConnected = await client.isConnected();
    return {
      status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
      lastSeen: new Date()
    };
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeSessions: this.sessions.size
    };
  }
}
