/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-dupe-else-if */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';

type WASocket = ReturnType<typeof makeWASocket>;

import { Boom } from '@hapi/boom';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from 'src/redis/redis.service';
import { format } from 'date-fns';

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
  ) {}

  onModuleInit() {
    this.sessions = new Map<string, WASocket>();
  }

  async createSession(idUser: string) {
    if (!idUser)
      throw new Error(`tentativa de criar uma sessao sem o idValido`);

    if (this.sessions.get(idUser)) return;

    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        `auth/${idUser}`,
      );

      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        auth: state,
        version,
      });

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.log(`QR Code: ${qr}`);
          await this.redisService.set(
            `qrCode:${idUser}`,
            JSON.stringify({
              qr,
              initIn: format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
              expireIn: format(
                new Date(Date.now() + 1000 * 60),
                'dd/MM/yyyy HH:mm:ss',
              ), // 60 s
            }),
          );
        }

        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !==
            +DisconnectReason.loggedOut;

          this.logger.warn(
            `Connection closed for ${idUser}: ${lastDisconnect?.error?.message || 'Unknown error'}, shouldReconnect: ${shouldReconnect}`,
          );

          if (shouldReconnect) {
            this.sessions.delete(idUser);
            this.createUserQueue
              .add('create-user', {
                idUser,
              })
              .then(() => {
                this.logger.log(`Reconnecting ${idUser}...`);
              })
              .catch((error) => {
                this.logger.error(`Failed to reconnect ${idUser}:`, error);
              });
          }
        } else if (connection === 'open') {
          this.logger.log(`Connection opened for ${idUser}`);
        } else if (connection === 'connecting') {
          this.logger.log(`Connecting ${idUser}...`);
        } else if (connection === 'open') {
          this.logger.log(`Connection opened for ${idUser}`);
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
      this.retryCount.delete(idUser); // Reset retry count on successful connection
    } catch (error) {
      this.logger.error(`Failed to create session for ${idUser}:`, error);
      throw error;
    }
  }
}
