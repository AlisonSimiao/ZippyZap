import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { Queue } from 'bullmq';
import { LoginhDto, ResponseLogin } from 'src/auth/dto/login-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';

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

    if (!user || !(await compare(body.password, user.password))) {
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

    await this.prisma.user.create({
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
