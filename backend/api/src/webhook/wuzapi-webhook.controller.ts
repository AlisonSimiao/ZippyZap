import {
  Body,
  Controller,
  Post,
  Logger,
  Res,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { Response } from 'express';
import { getQueueToken } from '@nestjs/bullmq';
import { EProcessor } from 'src/queue-board/queue-board.module';
import {
  IWebhookJob,
  IWuzaoiReceiptEvent,
  IWuzapiMessageEvent,
  QRWebhookJob,
} from './webhook-job.types';

interface WuzapiWebhookPayload<T> {
  instanceName: string;
  event: T;
  jsonData: string;
  type: string;
  userID: string;
}

@Controller('webhooks')
export class WuzapiWebhookController {
  private readonly logger = new Logger(WuzapiWebhookController.name);

  constructor(
    @Inject(getQueueToken(EProcessor.WEBHOOK))
    private readonly webhookQueue: Queue,
  ) {}

  @Post('wuzapi')
  @HttpCode(HttpStatus.OK)
  async handleWuzapiWebhook(
    @Body() body: WuzapiWebhookPayload<any>,
    @Res() res: Response,
  ) {
    res.status(200).send('OK');

    try {
      console.log(body);
      const payload = body.event as Record<string, any>;

      this.logger.log(
        `Received webhook: ${body.type} for session ${body.userID}`,
      );
      const userId = body.instanceName;
      let jobData: IWebhookJob | null = null;

      switch (body.type) {
        case 'QR':
          jobData = this.QR(body);
          break;

        case 'status':
          jobData = this.status(body);
          break;

        case 'Message':
        case 'message':
          jobData = this.message(body);
          break;

        case 'ReadReceipt':
          this.logger.log(`Read receipt for user ${userId}`);
          /* jobData = {
            idUser: userId,
            type: 'message.read' as const,
            data: body.event,
          }; */
          break;

        case 'Receipt':
          this.logger.log(`Receipt for user ${userId}`);

          jobData = this.messageRead(body);
          //jobData = { idUser: userId, type: 'receipt', data: body.event };
          break;

        case 'Presence':
          this.logger.log(`Presence update for user ${userId}`);
          //jobData = { idUser: userId, type: 'presence', data: body.event };
          break;

        case 'ChatPresence':
          this.logger.log(`Chat presence for user ${userId}`);
          //jobData = { idUser: userId, type: 'chat_presence', data: body.event };
          break;

        case 'HistorySync':
          this.logger.log(`History sync for user ${userId}`, payload);
          //jobData = { idUser: userId, type: 'history_sync', data: body.event };
          break;

        case 'Group':
          this.logger.log(`Group event for user ${userId}`);
          //jobData = { idUser: userId, type: 'group', data: body.event };
          break;

        case 'UndecryptableMessage':
          this.logger.warn(`Undecryptable message for user ${userId}`);
          /* jobData = {
            idUser: userId,
            type: 'undecryptable_message',
            data: body.event,
          }; */
          break;

        case 'MediaRetry':
          this.logger.log(`Media retry for user ${userId}`);
          //jobData = { idUser: userId, type: 'media_retry', data: body.event };
          break;

        default:
          this.logger.debug('Unhandled event:', payload, ` for user ${userId}`);
      }

      if (jobData) await this.webhookQueue.add(jobData.type, jobData);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing webhook:`, error);
      return { success: false, error: (error as { message: string })?.message };
    }
  }
  messageRead(
    body: WuzapiWebhookPayload<IWuzaoiReceiptEvent>,
  ): IWebhookJob | null {
    return {
      data: {
        messageIds: body.event.MessageIDs,
        chatId: body.event.Chat,
        sender: body.event.Sender.split('@')[0],
        timestamp: body.event.Timestamp,
      },
      idUser: body.instanceName,
      type: 'message.read' as const,
    };
  }

  message(body: WuzapiWebhookPayload<IWuzapiMessageEvent>): IWebhookJob | null {
    /*  this.logger.log(
      `Message received for user ${body.instanceName}: ${body.event.Info.Chat}`,
    ); */

    const messageData = body.event;
    let media, reaction;

    const ignore = !!messageData.Message.senderKeyDistributionMessage;

    if (ignore) return null;

    if (messageData.Message.imageMessage) {
      media = {
        thumbnail: messageData.Message.imageMessage?.JPEGThumbnail || '',
        width: messageData.Message.imageMessage?.width || 0,
        height: messageData.Message.imageMessage?.height || 0,
        mimeType: messageData.Message.imageMessage?.mimetype || '',
        size: messageData.Message.imageMessage?.fileLength || 0,
      };
    }

    if (messageData.Message.ptvMessage) {
      media = {
        thumbnail: messageData.Message.ptvMessage?.JPEGThumbnail || '',
        width: messageData.Message.ptvMessage?.width || 0,
        height: messageData.Message.ptvMessage?.height || 0,
        mimeType: messageData.Message.ptvMessage?.mimetype || '',
        size: messageData.Message.ptvMessage?.fileLength || 0,
      };
    }

    if (messageData.Message.reactionMessage) {
      reaction = {
        emoji: messageData.Message.reactionMessage?.text,
        participant:
          messageData.Message.reactionMessage.key.participant.split('@')[0] ||
          '',
        idMessage: messageData.Message.reactionMessage.key.ID || '',
      };
    }

    return {
      idUser: body.instanceName,
      type: 'message.received' as const,
      data: {
        chatId: messageData.Info.Chat,
        sender: messageData.Info.SenderAlt.split('@')[0],
        timestamp: messageData.Info.Timestamp,
        type: messageData.Info.Type,
        text:
          messageData?.Message?.conversation ??
          messageData?.Message?.extendedTextMessage?.text ??
          null,
        reply:
          messageData.Message?.messageContextInfo?.quotedMessage
            ?.conversation ??
          messageData.Message?.messageContextInfo?.quotedMessage
            ?.extendedTextMessage?.text ??
          null,
        senderName: messageData.Info.PushName,
        media,
        reaction,
        idMessage: messageData.Info.ID,
        isFromMe: messageData.Info.IsFromMe,
        isGroup: messageData.Info.IsGroup,
        isEdit: messageData.Info.Edit,
      },
    } as IWebhookJob;
  }

  status(
    body: WuzapiWebhookPayload<{
      status: 'connected' | 'disconnected';
      timestamp: string;
    }>,
  ): IWebhookJob {
    this.logger.log(
      `Status update for user ${body.instanceName}: ${JSON.stringify(body.event)}`,
    );

    return {
      idUser: body.instanceName,
      type: `session.${body.event.status}` as const,
      data: body.event,
    };
  }

  QR(
    payload: WuzapiWebhookPayload<{
      qrCodeBase64: string;
      instanceName: string;
    }>,
  ): QRWebhookJob | null {
    const idUser = payload.instanceName;

    if (payload['qrCodeBase64']) {
      this.logger.log(`QR code stored for user ${idUser}`);

      return {
        idUser,
        type: 'QR' as const,
        data: {
          qr: payload['qrCodeBase64'] as string,
          expireAt: Date.now() + 60000,
        },
      };
    }

    this.logger.log(`QR code not found for user ${idUser}`);
    return null;
  }
}
