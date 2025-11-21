import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Controller('whatsapp')
export class WhatsappController {
    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly userService: UserService
    ) { }

    @Post()
    async sendMessage(
        @Body() body: SendMessageDto,
        @Req() req: Request & { apiKey: { userId: number } },
    ) {
        const { phone, text } = body;

        const userId = req.apiKey.userId.toString();

        await this.whatsappService.sendMessage(userId, phone, text);
        return { message: 'Mensagem enviada para a fila' };
    }

    @Get('qrcode')
    getWhatsAppQRCode(@Req() req: Request & { apiKey: { userId: number } }) {
        return this.userService.getWhatsAppQRCode(req.apiKey.userId.toString());
    }

    @Post('session')
    createWhatsAppSession(@Req() req: Request & { apiKey: { userId: number } }) {
        return this.userService.createWhatsAppSession(req.apiKey.userId.toString());
    }
}
