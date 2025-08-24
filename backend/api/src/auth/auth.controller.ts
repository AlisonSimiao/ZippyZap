import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginhDto, ResponseLogin } from './dto/login-auth.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginhDto): Promise<ResponseLogin> {
    return this.userService.login(loginDto);
  }
}
