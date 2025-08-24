import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { RedisService } from 'src/redis/redis.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly redisService: RedisService,
  ) {}

  @Get('qrcode/:userId')
  async getQRCode(@Param('userId') userId: string) {
    const qrCode = await this.redisService.get(`qrCode:${userId}`);
    return { qrCode };
  }

  @Post('session')
  async createSession(@Body('userId') userId: string) {
    await this.whatsappService.createSession(userId);
    return { message: 'Sessão criada com sucesso' };
  }
}