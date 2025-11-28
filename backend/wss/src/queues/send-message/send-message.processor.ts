import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { EProcessor } from '../types';

interface IJobData {
  idUser: string;
  telefone: string;
  text: string;
}

@Processor(EProcessor.SEND_MESSAGE)
export class SendMessage extends WorkerHost {
  constructor(private readonly whatsappService: WhatsappService) {
    super();
  }

  private readonly logger = new Logger(SendMessage.name);

  async process(job: Job<IJobData>): Promise<any> {
    this.logger.log(`Processing job: ${job.id}`, job.data);

    const { idUser, telefone, text } = job.data;

    try {
      await this.whatsappService.sendMessage(idUser, telefone, text);
      this.logger.log(`Message sent successfully: ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to send message: ${job.id}`, error.message);

      // Se for erro de stack overflow, não fazer retry
      if (error.message.includes('Maximum call stack size exceeded')) {
        throw new Error('WhatsApp session error - session needs restart');
      }

      throw error;
    }

    return;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job completed: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job failed: ${job.id} - ${err.message}`, err.stack);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job started: ${job.id}`);
  }
}
