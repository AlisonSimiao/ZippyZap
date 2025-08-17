import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginhDto, ResponseLogin } from 'src/auth/dto/login-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(body: LoginhDto): Promise<ResponseLogin> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !(await compare(body.login, user.password))) {
      throw new ForbiddenException('Invalid credentials');
    }

    const newUser = { ...user, password: undefined };

    return {
      token: this.jwtService.sign({ id: user.id }),
      user: newUser,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword: string = await hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }
}
