import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserModule } from 'src/user/user.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { WebhookModule } from 'src/webhook/webhook.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [UserModule, WhatsappModule, WebhookModule, RedisModule],
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
})
export class DashboardModule {}
