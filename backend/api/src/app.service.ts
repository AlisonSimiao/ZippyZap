import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class AppService {
  private queue = new Queue('create-user', {
    connection: { host: 'localhost', port: 6379 },
  });

  async healthCheck(): Promise<string> {
    try {
      const job1 = await this.queue.add('create-user-host', {
        name: 'John Doe',
        age: 30,
      });

      const job2 = await this.queue.add('create-user-host', {
        name: 'Jane Doe',
        age: 25,
      });

      console.log('Jobs added:', job1.id, job2.id);
      return `Jobs added: ${job1.id}, ${job2.id}`;
    } catch (error) {
      console.error('Error adding jobs:', error);
      return 'Error adding jobs';
    }
  }
}
