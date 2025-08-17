import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [AuthController],
  providers: [UserService],
})
export class AuthModule {}
