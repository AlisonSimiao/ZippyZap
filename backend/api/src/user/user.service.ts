import {
  ConflictException,
  ForbiddenException,
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginhDto, ResponseLogin } from 'src/auth/dto/login-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @InjectQueue('create-user') private queue: Queue,
    private redisService: RedisService,
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

    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: createUserDto.email,
          },
          {
            whatsapp: createUserDto.whatsapp,
          },
        ],
      },
      select: {
        email: true,
        whatsapp: true,
      },
    });

    if (userExists) {
      const [prop, value] =
        userExists.email === createUserDto.email
          ? ['Email', createUserDto.email]
          : ['Whatsapp', createUserDto.whatsapp];

      throw new ConflictException(`Usuario com ${prop} '${value}' já existe`);
    }

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        whatsapp: createUserDto.whatsapp,
        password: hashedPassword,
      },
      select: {
        id: true,
        whatsapp: true,
      },
    });
  }

  async getWhatsAppQRCode(idUser: string): Promise<string> {
    const qr = await this.redisService.get(`qrCode:${idUser}`);

    if (!qr) {
      throw new NotFoundException(
        'QR code not found',
        'tenha certeza que já usou a rota de criar sessao',
      );
    }

    return qr;
  }

  async createWhatsAppSession(idUser: string) {
    await this.queue.add('create-user', {
      idUser,
    });
  }
}
