import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes } from 'crypto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ApiKeyService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  generateToken(prefix = 'zzw-') {
    return prefix.concat(randomBytes(24).toString('base64'));
  }

  encriptToken(token: string) {
    const first = token.slice(0, 4);
    const last = token.slice(-4);

    return (
      first +
      Array(24 - (first.length + last.length))
        .fill('*')
        .join('') +
      last
    );
  }

  async paginate() {
    const data = await this.prisma.apiKey.findMany({
      select: {
        hash: true,
        id: true,
        status: true,
        name: true,
        createdAt: true,
      },
    });

    return data.map((item) => ({
      ...item,
      hash: this.encriptToken(item.hash),
    }));
  }

  async createApiKey(body: CreateApiKeyDto, userId: number, prefix = '') {
    const token = this.generateToken(prefix);

    const apikey =
      body.name &&
      (await this.prisma.apiKey.findFirst({
        where: { name: body.name, userId },
      }));

    if (apikey)
      throw new ConflictException(`Api key com nome '${body.name}' ja existe`);

    await this.prisma.apiKey.create({
      data: {
        name: prefix.concat(body.name || randomBytes(5).toString('base64')),
        hash: token,
        status: body.status,
        userId: userId,
      },
    });

    return {
      token,
    };
  }

  async update(name: string, body: UpdateApiKeyDto, userId: number) {
    const apikey = await this.prisma.apiKey.findFirst({
      where: { name, userId },
      select: {
        id: true,
      },
    });

    if (!apikey)
      throw new NotFoundException(`Api key com nome '${name}' não existe`);

    if (body.name) {
      const conflict = await this.prisma.apiKey.findFirst({
        where: {
          id: {
            not: apikey?.id,
          },
          name: body.name,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (conflict)
        throw new NotFoundException(
          `Api key com nome '${body.name}' ja existe`,
        );
    }

    let token: string | undefined;

    if (body.generateToken) {
      token = this.generateToken();
    }

    await this.prisma.apiKey.update({
      where: {
        id: apikey.id,
      },
      data: {
        name: body.name,
        status: body.status,
        hash: token,
      },
    });

    return {
      token,
    };
  }

  async delete(name: string, userId: number) {
    const apikey = await this.prisma.apiKey.findFirst({
      where: { name, userId },
      select: {
        id: true,
        hash: true,
      },
    });

    if (!apikey)
      throw new NotFoundException(`Api key com nome '${name}' não existe`);

    await this.prisma.apiKey
      .delete({
        where: {
          id: apikey.id,
        },
      })
      .then(async () => {
        return this.redis.delete(`api-key:${apikey.hash}`);
      });
  }
}
