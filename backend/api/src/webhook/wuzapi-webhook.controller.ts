import { Body, Controller, Post, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { RedisService } from 'src/redis/redis.service';

interface WuzapiWebhookPayload {
  instanceName: '3',
  jsonData: string,
  userID: string
}

@Controller('webhooks')
export class WuzapiWebhookController {
    private readonly logger = new Logger(WuzapiWebhookController.name);

    constructor(private readonly redisService: RedisService) { }

    @Post('wuzapi')
    async handleWuzapiWebhook(@Body() body: WuzapiWebhookPayload, @Res() res: Response) {
        res.status(200).send('OK'); 
        const payload = JSON.parse(body.jsonData);
        this.logger.log(`Received webhook: ${payload.type} for session ${body.userID}`);
        console.log(payload)
        try {
            // Extract userId from session (session format is the userId)
            const userId = body.instanceName;

            switch (payload.type) {
                case 'QR':
                    // Store QR code in Redis
                    if (payload.qrCodeBase64) {
                        await this.redisService.setWithExpiration(
                            `user:${userId}:qrcode`,
                            JSON.stringify({
                                qr: payload.qrCodeBase64,
                                expireAt: Date.now() + 60000,
                            }),
                            60,
                        );
                        this.logger.log(`QR code stored for user ${userId}`);
                    }
                    break;

                case 'Connected':
                case 'ready':
                case 'authenticated':
                    // Session connected
                    await this.redisService.set(`user:${userId}:status`, 'connected');
                    await this.redisService.delete(`user:${userId}:qrcode`);
                    this.logger.log(`User ${userId} connected`);
                    break;

                case 'Disconnected':
                case 'disconnected':
                case 'auth_failure':
                    // Session disconnected
                    await this.redisService.delete(`user:${userId}:status`);
                    await this.redisService.delete(`user:${userId}:qrcode`);
                    this.logger.log(`User ${userId} disconnected`);
                    break;

                case 'Message':
                case 'message':
                    // Handle incoming message
                    this.logger.log(
                        `Message received for user ${userId}: ${JSON.stringify(payload.data)}`,
                    );
                    // TODO: Process incoming message (webhook dispatch, etc.)
                    break;

                default:
                    this.logger.debug(`Unhandled event: ${payload.event}`);
            }

            return { success: true };
        } catch (error) {
            this.logger.error(`Error processing webhook:`, error);
            return { success: false, error: error.message };
        }
    }
}
