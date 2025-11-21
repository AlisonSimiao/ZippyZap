import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from 'src/redis/redis.service';
import * as wppconnect from '@wppconnect-team/wppconnect';

enum EStatusConnction {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

@Injectable()
export class WhatsappService implements OnModuleInit {
  private sessions: Map<string, wppconnect.Whatsapp>;
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
            await this.createSession(idUser);
          }
        }
      }
    } catch (error) {
      this.logger.error('Erro ao restaurar sessões:', error);
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
        headless: true,
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: false,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Reduz uso de memória
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

      client.onMessage(async (msg) => {
        switch (msg.type) {
          case wppconnect.MessageType.CHAT: // texto
            console.log('Texto:', msg.body);
            break;

          case wppconnect.MessageType.IMAGE:
            console.log('Imagem com legenda:', msg.caption);
            break;

          case wppconnect.MessageType.AUDIO: // áudio
            console.log('Áudio recebido');
            break;

          case wppconnect.MessageType.VIDEO: // vídeo
            console.log('Vídeo:', msg.caption);
            break;

          case wppconnect.MessageType.STICKER: // sticker
            console.log('Sticker');
            break;

          case wppconnect.MessageType.BUTTONS_RESPONSE: // botão
            console.log('Botão clicado:', msg.body);
            break;

          case wppconnect.MessageType.LIST_RESPONSE: // lista
            console.log('Lista selecionada:', msg.body);
            break;

          default:
            console.log('Tipo de mensagem desconhecido:', msg.type, msg);
        }
      });

      client.onStateChange((state) => {
        this.logger.log(`State changed: ${state}`);
        if (state === 'CONFLICT' || state === 'UNPAIRED' || state === 'UNLAUNCHED') {
          this.logger.warn(`Sessão desconectada/conflito: ${state}`);
          client.close();
          this.sessions.delete(idUser);
          this.redisService.del(`user:${idUser}:status`);
        }
      });

    } catch (error) {
      this.logger.error(`Erro ao criar sessão para ${idUser}:`, error);
      throw error;
    }
  }

  async sendMessage(idUser: string, phone: string, text: string) {
    const client = this.sessions.get(idUser);
    if (!client) {
      throw new Error(`Sessão não encontrada para o usuário ${idUser}`);
    }

    // WPPConnect uses '5516988532085@c.us' format
    const chatId = `${phone}@c.us`;
    await client.sendText(chatId, text);
  }
}
