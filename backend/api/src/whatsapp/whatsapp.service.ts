import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, BadRequestException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class WhatsappService {
    constructor(
        @InjectQueue('send-message') private readonly sendMessageQueue: Queue,
        private readonly redisService: RedisService,
    ) { }

    async sendMessage(userId: string, phone: string, text: string) {
        const status = await this.redisService.get(`user:${userId}:status`);

        if (status !== 'connected') {
            throw new BadRequestException('User not connected to WhatsApp');
        }

        await this.sendMessageQueue.add('send-message', {
            idUser: userId,
            telefone: phone,
            text,
        });
    }
}
