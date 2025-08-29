import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(PrismaService.name);

  async onModuleInit() {
    if (!process.env.DATABASE_URL)
      this.logger.error('DATABASE_URL is not defined');

    await this.$connect()
      .then(() => {
        const url = process.env.DATABASE_URL?.replace(
          /\/\/(.*)@/,
          '//***:***@',
        );
        this.logger.debug(`Connected to database: ${url}`);
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  async onModuleDestroy() {
    await this.$disconnect()
      .then(() => this.logger.debug('Disconnected from database'))
      .catch((error) => this.logger.error(error));
  }
}
