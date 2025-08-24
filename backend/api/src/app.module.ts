import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { PlanModule } from './plan/plan.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRE },
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    PlanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
