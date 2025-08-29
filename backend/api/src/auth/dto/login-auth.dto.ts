import { User } from 'src/user/entities/user.entity';

export class ResponseLogin {
  public token: string;
  user: User;
}

export class LoginhDto {
  email: string;
  password: string;
}
