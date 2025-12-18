import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { PlanLimitGuard } from 'src/auth/guards/plan-limit.guard';
import { RedisService } from 'src/redis/redis.service';
import { format } from 'date-fns';

interface ApiKeyRequest extends Request {
  apiKey: {
    userId: number;
    hash: string;
  };
}

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly userService: UserService,
    private readonly redis: RedisService,
  ) {}

  @Post()
  @UseGuards(PlanLimitGuard)
  async sendMessage(@Body() body: SendMessageDto, @Req() req: ApiKeyRequest) {
    const { to: phone, message: text } = body;

    const userId = req.apiKey.userId.toString();

    await this.whatsappService.sendMessage(userId, phone, text);

    // Increment Usage Counters
    const today = format(new Date(), 'yyyy-MM-dd');
    const month = format(new Date(), 'yyyy-MM');
    const dailyKey = `usage:daily:${userId}:${today}`;
    const monthlyKey = `usage:monthly:${userId}:${month}`;

    const dailyCount = await this.redis.incr(dailyKey);
    if (dailyCount === 1) await this.redis.expire(dailyKey, 86400 * 2); // 2 days TTL

    const monthlyCount = await this.redis.incr(monthlyKey);
    if (monthlyCount === 1) await this.redis.expire(monthlyKey, 86400 * 35); // 35 days TTL

    return { message: 'Mensagem enviada para a fila' };
  }

  @Get('qrcode')
  getWhatsAppQRCode(@Req() req: ApiKeyRequest) {
    return this.userService.getWhatsAppQRCode(req.apiKey.userId.toString());
  }

  @Post('session')
  createWhatsAppSession(@Req() req: ApiKeyRequest) {
    return this.userService.createWhatsAppSession(
      req.apiKey.userId.toString(),
      req.headers['x-api-key'] as string,
    );
  }

  @Delete('session')
  logoutWhatsAppSession(@Req() req: ApiKeyRequest) {
    return this.userService.logout(req.apiKey.userId.toString());
  }

  @Get('status')
  getStatus(@Req() req: ApiKeyRequest) {
    return this.userService.getStatus(req.apiKey.userId.toString());
  }
}
