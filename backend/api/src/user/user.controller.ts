import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginhDto, ResponseLogin } from 'src/auth/dto/login-auth.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginhDto): Promise<ResponseLogin> {
    return this.userService.login(loginDto);
  }

  @Post('create-api-key')
  createAPIKey() {}

  @Get('whatsapp/qrcode/:userId')
  getWhatsAppQRCode(@Param('userId') userId: string) {
    return this.userService.getWhatsAppQRCode(userId);
  }

  @Post('whatsapp/session')
  createWhatsAppSession(@Body('userId') userId: string) {
    return this.userService.createWhatsAppSession(userId);
  }
}
