import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class StatusCheckService implements OnModuleInit {
    private readonly logger = new Logger(StatusCheckService.name);

    constructor(@InjectQueue('status-check') private statusCheckQueue: Queue) { }

    async onModuleInit() {
        this.logger.log('Initializing Status Check Queue...');

        // Remove existing repeatable jobs to avoid duplicates if config changes
        const repeatableJobs = await this.statusCheckQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await this.statusCheckQueue.removeRepeatableByKey(job.key);
        }

        // Add repeatable job
        await this.statusCheckQueue.add(
            'check-status',
            {},
            {
                repeat: {
                    every: 30000, // Every 30 seconds
                },
                removeOnComplete: true,
                removeOnFail: true,
            },
        );

        this.logger.log('Status Check Job scheduled (every 60s)');
    }
}
