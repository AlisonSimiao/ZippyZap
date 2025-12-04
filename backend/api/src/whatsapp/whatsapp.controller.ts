import { Body, Controller, Get, Post, Delete, Req } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

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
  ) {}

  @Post()
  async sendMessage(@Body() body: SendMessageDto, @Req() req: ApiKeyRequest) {
    const { to: phone, message: text } = body;

    const userId = req.apiKey.userId.toString();

    await this.whatsappService.sendMessage(userId, phone, text);
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
