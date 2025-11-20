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
        await this.whatsappService.sendMessage(idUser, telefone, text);

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
