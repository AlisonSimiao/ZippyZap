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
import { Throttle } from 'src/auth/decorators/throttle.decorator';
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
  @Throttle(100, 60) // ✨ 100 req/min (operação cara)
  async sendMessage(@Body() body: SendMessageDto, @Req() req: ApiKeyRequest) {
    const { to: phone, message: text } = body;
    const userId = req.apiKey.userId.toString();

    try {
      // Enviar mensagem para fila
      await this.whatsappService.sendMessage(userId, phone, text);

      // ✅ Só incrementa contadores se sucesso
      const today = format(new Date(), 'yyyy-MM-dd');
      const month = format(new Date(), 'yyyy-MM');
      const dailyKey = `usage:daily:${userId}:${today}`;
      const monthlyKey = `usage:monthly:${userId}:${month}`;

      // Usar incrWithExpiry para garantir TTL em uma operação atômica
      await this.redis.incrWithExpiry(dailyKey, 86400 * 2); // 2 dias
      await this.redis.incrWithExpiry(monthlyKey, 86400 * 35); // 35 dias

      return { message: 'Mensagem enviada para a fila' };
    } catch (error) {
      // ❌ Se falhar em qualquer ponto, não incrementa
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao enviar mensagem');
    }
  }

  @Get('qrcode')
  @Throttle(500, 60) // ✨ 500 req/min (leitura rápida)
  getWhatsAppQRCode(@Req() req: ApiKeyRequest) {
    return this.userService.getWhatsAppQRCode(req.apiKey.userId.toString());
  }

  @Post('session')
  @Throttle(50, 60) // ✨ 50 req/min (criação de sessão)
  createWhatsAppSession(@Req() req: ApiKeyRequest) {
    return this.userService.createWhatsAppSession(
      req.apiKey.userId.toString(),
      req.headers['x-api-key'] as string,
    );
  }

  @Delete('session')
  @Throttle(50, 60) // ✨ 50 req/min (deletar sessão)
  logoutWhatsAppSession(@Req() req: ApiKeyRequest) {
    return this.userService.logout(req.apiKey.userId.toString());
  }

  @Get('status')
  @Throttle(1000, 60) // ✨ 1000 req/min (status check é rápido)
  getStatus(@Req() req: ApiKeyRequest) {
    return this.userService.getStatus(req.apiKey.userId.toString());
  }
}
