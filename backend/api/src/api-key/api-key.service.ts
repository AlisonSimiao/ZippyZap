import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  generateToken(prefix = 'key') {
    return prefix.concat(randomBytes(24).toString('base64'));
  }

  encript(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  paginate() {
    return this.prisma.apiKey.findMany({
      select: {
        id: true,
        status: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async createApiKey(body: CreateApiKeyDto, userId: number, prefix = '') {
    const token = this.generateToken(prefix);
    const encriptedToken = this.encript(token);

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
        hash: encriptedToken,
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
    let encriptedToken: string | undefined;

    if (body.generateToken) {
      token = this.generateToken();
      encriptedToken = this.encript(token);
    }

    await this.prisma.apiKey.update({
      where: {
        id: apikey.id,
      },
      data: {
        name: body.name,
        status: body.status,
        hash: encriptedToken,
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
      },
    });

    if (!apikey)
      throw new NotFoundException(`Api key com nome '${name}' não existe`);

    await this.prisma.apiKey.delete({
      where: {
        id: apikey.id,
      },
    });
  }
}
