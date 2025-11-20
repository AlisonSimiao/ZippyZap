import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { EProcessor } from '../types';

interface IJobData {
  idUser: number;
  whatsapp: string;
}


@Processor(EProcessor.CREATE_USER)
export class UserCreate extends WorkerHost {
  constructor(private readonly whatsappService: WhatsappService) {
    super();
  }

  private readonly logger = new Logger(EProcessor.CREATE_USER);

  async process(job: Job<IJobData>): Promise<any> {
    this.logger.log(`Processing job: ${job.id}`, job.data);

    await this.whatsappService.createSession(job.data.idUser.toString());

    return;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job completed: ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job failed: ${job.id} - ${err.message}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job started: ${job.id}`);
  }
}
