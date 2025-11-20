import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';

import { Boom } from '@hapi/boom';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { format } from 'date-fns';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private sessions: Map<string, WASocket>;
  private retryCount: Map<string, number> = new Map();
  private logger = new Logger('WhatsappService');
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000;

  constructor(
    @InjectQueue('create-user') private readonly createUserQueue: Queue,
    private redisService: RedisService,
  ) { }

  onModuleInit() {
    this.sessions = new Map<string, WASocket>();
  }

  async createSession(idUser: string) {
    if (!idUser)
      throw new Error(`tentativa de criar uma sessao com o idValido`);

    if (this.sessions.get(idUser)) return;

    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        `auth/${idUser}`,
      );

      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        auth: state,
        version,
        browser: ['Zapi', 'Chrome', '1.0.0'],
        printQRInTerminal: false,
        defaultQueryTimeoutMs: undefined,
      });

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.log(`gerado QR Code: ${idUser}`);
          await this.redisService.publish(
            `user:${idUser}:qrcode`,
            JSON.stringify({
              qr,
              expireIn: format(
                new Date(Date.now() + 1000 * 59),
                'dd/MM/yyyy HH:mm:ss',
              ),
            }),
          );
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;
          const shouldReconnect =
            statusCode !== DisconnectReason.loggedOut &&
            statusCode !== DisconnectReason.connectionClosed;

          this.logger.warn(
            `Connection closed for ${idUser}: ${lastDisconnect?.error?.message || 'Unknown error'}, shouldReconnect: ${shouldReconnect}`,
          );

          if (shouldReconnect) {
            const currentRetries = this.retryCount.get(idUser) || 0;

            if (currentRetries < this.MAX_RETRIES) {
              this.retryCount.set(idUser, currentRetries + 1);
              this.logger.log(
                `Reconnecting ${idUser} (Attempt ${currentRetries + 1}/${this.MAX_RETRIES})...`,
              );
              setTimeout(() => this.createSession(idUser), this.RETRY_DELAY);
            } else {
              this.logger.error(
                `Max retries reached for ${idUser}. Removing session.`,
              );
              this.sessions.delete(idUser);
              this.retryCount.delete(idUser);
              // Optional: Notify user or take other action
            }
          } else {
            this.sessions.delete(idUser);
            this.retryCount.delete(idUser);
            if (statusCode === DisconnectReason.loggedOut) {
              this.logger.log(`User ${idUser} logged out.`);
            }
          }
        } else if (connection === 'open') {
          this.logger.log(`Connection opened for ${idUser}`);
          this.retryCount.delete(idUser); // Reset retry count on successful connection
        } else if (connection === 'connecting') {
          this.logger.log(`Connecting ${idUser}...`);
        }
      });

      sock.ev.on('messages.upsert', (event) => {
        for (const m of event.messages) {
          this.logger.log(JSON.stringify(m, undefined, 2));
        }
      });

      // to storage creds (session info) when it updates
      sock.ev.on('creds.update', saveCreds);

      this.sessions.set(idUser, sock);
    } catch (error) {
      this.logger.error(`Failed to create session for ${idUser}:`, error);
      throw error;
    }
  }

  async sendMessage(idUser: string, phone: string, text: string) {
    const session = this.sessions.get(idUser);
    if (!session) {
      throw new Error(`Session not found for user ${idUser}`);
    }

    const jid = `${phone}@s.whatsapp.net`;
    await session.sendMessage(jid, { text });
  }
}
