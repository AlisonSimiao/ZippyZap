import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, BadRequestException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';
import { format } from 'date-fns';

@Injectable()
export class WhatsappService {
  constructor(
    @InjectQueue('send-message') private readonly sendMessageQueue: Queue,
    private readonly redisService: RedisService,
  ) { }

  normalizePhone(phone: string) {
    phone = phone.replace(/\D/g, ''); // remove tudo que não é número
    if (phone.length === 10 || phone.length === 11) {
      return '55' + phone; // adiciona DDI Brasil
    }
    return phone; // se já veio com DDI
  }

  async sendMessage(userId: string, phone: string, text: string) {
    const status = await this.redisService.get(`user:${userId}:status`);

    if (status !== 'connected') {
      throw new BadRequestException('User not connected to WhatsApp');
    }

    await this.sendMessageQueue.add(
      'send-message',
      {
        idUser: userId,
        telefone: this.normalizePhone(phone),
        text,
      },
      {
        jobId: `${userId}:${phone}:${format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'-03:00'")}`,
      },
    );
  }
}
