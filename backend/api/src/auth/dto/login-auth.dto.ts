import { IsEmail, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class ResponseLogin {
  public token: string;

  user: User;
}

export class LoginhDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
