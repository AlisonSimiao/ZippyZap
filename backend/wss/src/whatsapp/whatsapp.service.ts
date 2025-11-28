import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as wppconnect from '@wppconnect-team/wppconnect';
import { RedisService } from 'src/redis/redis.service';

interface SessionState {
  client?: wppconnect.Whatsapp;
  status:
  | 'starting'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'auth_failure'
  | 'qr'
  | 'destroyed';
  attempts: number;
  reconnectTimer?: NodeJS.Timeout;
}

@Injectable()
export class WhatsappService implements OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private sessions = new Map<string, SessionState>();

  // config padrão, pode ser externalizada
  private readonly maxAttempts = 8;
  private readonly backoffBaseMs = 2000; // 2s base
  private readonly heartbeatIntervalMs = 30_000; // 30s heartbeat
  private heartbeats = new Map<string, NodeJS.Timer>();

  constructor(private readonly redisService: RedisService) {
    void this._loadExistingSessions();
  }

  async createSession(sessionId: string, opts?: { headless?: boolean }) {
    if (this.sessions.has(sessionId)) {
      const st = this.sessions.get(sessionId);
      if (
        st &&
        (st.status === 'connected' ||
          st.status === 'starting' ||
          st.status === 'connecting')
      ) {
        this.logger.log(
          `[${sessionId}] Sessão já existe ou está iniciando (status: ${st.status}). Retornando client se disponível.`,
        );
        return st.client;
      }
    }

    this.logger.log(`Criando sessão: ${sessionId}`);
    // Initialize with 'starting' to block early disconnect events
    const state: SessionState = { status: 'starting', attempts: 0 };
    this.sessions.set(sessionId, state);

    await this._startClient(sessionId, opts);
    return this.sessions.get(sessionId)?.client;
  }

  private async _startClient(sessionId: string, opts?: { headless?: boolean }) {
    const state = this.sessions.get(sessionId);
    if (!state) return; // Session destroyed before start

    // If we are already destroyed, abort
    if (state.status === 'destroyed') {
      this.logger.warn(
        `[${sessionId}] Sessão destruída antes de iniciar o client. Abortando.`,
      );
      return;
    }

    try {
      state.status = 'starting'; // Ensure we are in starting state
      // incrementa tentativas
      state.attempts = (state.attempts ?? 0) + 1;

      const client = await wppconnect.create({
        session: sessionId,
        headless: opts?.headless ?? true,
        puppeteerOptions: {
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        useChrome: true,
        // tokenFolder para persistir sessão (ajuste conforme sua estrutura)
        tokenStore: 'file',
        folderNameToken: `./wpp-sessions/${sessionId}`,
        catchQR: (base64Qrimg: string, asciiQR: string, attempt, urlCode) => {
          // Check if destroyed during QR generation
          if (this.sessions.get(sessionId)?.status === 'destroyed') return;

          // Exibe QR para front-end ou log
          state.status = 'qr';
          this.logger.log(
            `[${sessionId}] QR gerado (tentativa ${attempt}). urlCode=${urlCode}`,
          );

          // Save QR to Redis with 60s expiration
          this.redisService.setWithExpiration(
            `user:${sessionId}:qrcode`,
            JSON.stringify({ qr: base64Qrimg, expireAt: Date.now() + 60000 }),
            60,
          );
        },
        logQR: false,
      });

      // CRITICAL CHECK: Session might have been destroyed while wppconnect.create was running
      if (this.sessions.get(sessionId)?.status === 'destroyed') {
        this.logger.warn(
          `[${sessionId}] Sessão foi destruída durante a inicialização. Fechando client recém-criado.`,
        );
        await client.close();
        return;
      }

      state.client = client;
      state.status = 'connected';
      state.attempts = 0; // reset sucesso

      this.logger.log(`[${sessionId}] Conectado com sucesso.`);
      await this.redisService.set(`user:${sessionId}:status`, 'connected');

      // listeners básicos
      if (client.onStateChange) {
        client.onStateChange((s: string) => {
          void this._onStateChange(sessionId, s);
        });
      }
      if (client.onMessage) {
        client.onMessage((msg: wppconnect.Message) => {
          this._onMessage(sessionId, msg);
        });
      }

      // heartbeat para checar estado e forçar reconnect se necessário
      this._startHeartbeat(sessionId);

      return client;
    } catch (err) {
      const errorMsg = (err as Error).message || String(err);
      this.logger.error(
        `[${sessionId}] Erro iniciando client: ${errorMsg}`,
      );

      if (errorMsg.includes('The browser is already running')) {
        this.logger.warn(
          `[${sessionId}] Falha ao iniciar pois o navegador já está rodando. Isso geralmente indica um processo zumbi.`,
        );
      }

      // If destroyed, do nothing
      if ((state.status as SessionState['status']) === 'destroyed') return;

      state.status = 'disconnected';
      this._scheduleReconnect(sessionId);
    }
  }

  private async _onStateChange(sessionId: string, stateStr: string) {
    this.logger.log(`[${sessionId}] Estado: ${stateStr}`);
    const st = this.sessions.get(sessionId);
    if (!st) return;

    // [FIX 1] Ignore events if we are in 'starting' phase (unless it's connected)
    // This prevents premature DISCONNECTED events from triggering reconnects while we are still setting up
    if (
      st.status === 'starting' &&
      !stateStr.toLowerCase().includes('connected')
    ) {
      this.logger.debug(
        `[${sessionId}] Ignorando evento ${stateStr} durante inicialização.`,
      );
      return;
    }

    if (st.status === 'destroyed') return;

    if (
      stateStr === 'CONNECTED' ||
      stateStr.toLowerCase().includes('connected')
    ) {
      st.status = 'connected';
      st.attempts = 0;
      await this.redisService.set(`user:${sessionId}:status`, 'connected');
      this._startHeartbeat(sessionId);
    } else if (
      stateStr === 'QRCODE' ||
      stateStr.toLowerCase().includes('qrcode')
    ) {
      st.status = 'qr';
      // QR is handled in catchQR usually, but we can mark status
    } else if (
      stateStr === 'DISCONNECTED' ||
      stateStr.toLowerCase().includes('disconnected')
    ) {
      // Only schedule reconnect if we are not already disconnected/reconnecting
      if (st.status !== 'disconnected' && st.status !== 'connecting') {
        st.status = 'disconnected';
        await this.redisService.del(`user:${sessionId}:status`);
        this._stopHeartbeat(sessionId);
        this._scheduleReconnect(sessionId);
      }
    } else if (
      stateStr === 'UNPAIRED' ||
      stateStr.toLowerCase().includes('auth_failure')
    ) {
      st.status = 'auth_failure';
      await this.redisService.del(`user:${sessionId}:status`);
      this._stopHeartbeat(sessionId);
      this._scheduleReconnect(sessionId);
    }
  }

  private _onMessage(sessionId: string, msg: wppconnect.Message) {
    // ponto para processar mensagens recebidas
    this.logger.log(
      `[${sessionId}] Mensagem recebida de ${msg.from}: ${msg.body ?? '[sem corpo]'}`,
    );
  }

  private _scheduleReconnect(sessionId: string) {
    const st = this.sessions.get(sessionId);
    if (!st) return;
    if (st.status === 'destroyed') return;

    // se já tem um timer, não agendar outro
    if (st.reconnectTimer) return;

    if ((st.attempts ?? 0) >= this.maxAttempts) {
      this.logger.error(
        `[${sessionId}] Ultrapassou tentativas máximas de reconexão (${this.maxAttempts}). Destruindo sessão.`,
      );
      this.destroySession(sessionId);
      return;
    }

    const attempt = (st.attempts ?? 0) + 1;
    const delay = this._backoffMs(attempt);
    this.logger.log(
      `[${sessionId}] Agendando reconexão #${attempt} em ${delay}ms`,
    );

    st.reconnectTimer = setTimeout(() => {
      st.reconnectTimer = undefined;
      // Check again if destroyed
      if (this.sessions.get(sessionId)?.status === 'destroyed') return;

      // tenta iniciar novamente
      void this._startClient(sessionId);
    }, delay);
  }

  private _backoffMs(attempt: number) {
    // exponential backoff with jitter
    const base = this.backoffBaseMs * Math.pow(2, attempt - 1);
    const jitter = Math.floor(Math.random() * 1000); // até 1s de jitter
    return base + jitter;
  }

  private _startHeartbeat(sessionId: string) {
    if (this.heartbeats.has(sessionId)) return;

    this.logger.debug(`[${sessionId}] Iniciando Heartbeat.`);
    const t = setInterval(() => {
      const st = this.sessions.get(sessionId);
      // [FIX 2] Only run heartbeat if strictly connected
      if (!st || st.status !== 'connected') {
        // If not connected, we shouldn't be running heartbeat, or at least not expecting it to work
        // But we don't want to trigger reconnect here if it's already handled elsewhere
        return;
      }

      const checkSession = async () => {
        try {
          // chama um método leve para validar sessão
          if (st.client && typeof st.client.getHostDevice === 'function') {
            await st.client.getHostDevice();
          } else if (
            st.client &&
            typeof st.client.getBatteryLevel === 'function'
          ) {
            await st.client.getBatteryLevel();
          }
        } catch (err) {
          this.logger.warn(
            `[${sessionId}] Heartbeat falhou: ${(err as Error).message || err}`,
          );

          // Double check status before acting
          if (st.status === 'connected') {
            st.status = 'disconnected';
            this._stopHeartbeat(sessionId);
            this._scheduleReconnect(sessionId);
          }
        }
      };

      void checkSession();
    }, this.heartbeatIntervalMs);
    this.heartbeats.set(sessionId, t);
  }

  private _stopHeartbeat(sessionId: string) {
    const t = this.heartbeats.get(sessionId);
    if (t) {
      clearInterval(t as any);
      this.heartbeats.delete(sessionId);
      this.logger.debug(`[${sessionId}] Heartbeat parado.`);
    }
  }

  async destroySession(sessionId: string) {
    this.logger.log(`Destruindo sessão ${sessionId}`);
    const st = this.sessions.get(sessionId);
    if (!st) return;

    // [FIX 3] Mark as destroyed immediately to prevent race conditions
    st.status = 'destroyed';

    try {
      if (st.reconnectTimer) {
        clearTimeout(st.reconnectTimer);
        st.reconnectTimer = undefined;
      }
      this._stopHeartbeat(sessionId);

      if (st.client) {
        try {
          await st.client.close();
        } catch (e) {
          this.logger.warn(`[${sessionId}] Erro ao fechar client: ${e}`);
        }
      }
    } catch (err) {
      this.logger.error(
        `Erro ao destruir sessão ${sessionId}: ${(err as Error).message || err}`,
      );
    } finally {
      this.sessions.delete(sessionId);
      // Clean up Redis keys
      await this.redisService.del(`user:${sessionId}:status`);
      await this.redisService.del(`user:${sessionId}:qrcode`);
    }
  }

  // Exemplo de método para enviar mensagem
  async sendText(sessionId: string, to: string, text: string) {
    const st = this.sessions.get(sessionId);
    if (!st || st.status !== 'connected' || !st.client)
      throw new Error('Sessão não conectada');
    return st.client.sendText(to, text);
  }

  // Alias para compatibilidade com código existente
  async sendMessage(sessionId: string, to: string, text: string) {
    return this.sendText(sessionId, to, text);
  }

  // Carrega sessões persistidas ao iniciar o service
  private async _loadExistingSessions() {
    try {
      const fs = await import('fs');
      const base = './wpp-sessions';
      if (!fs.existsSync(base)) return;

      const dirs = fs
        .readdirSync(base)
        .filter((d: string) => fs.lstatSync(`${base}/${d}`).isDirectory());

      for (const sessionId of dirs) {
        this.logger.log(`Carregando sessão existente: ${sessionId}`);
        // [FIX 4] Actually start the session
        void this.createSession(sessionId);
      }
    } catch (error) {
      this.logger.warn('Erro ao carregar sessões existentes:', error);
    }
  }

  async onModuleDestroy() {
    for (const sessionId of this.sessions.keys()) {
      await this.destroySession(sessionId);
    }
  }
}
