import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Injectable()
export class WebhookService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService
    ) { }

    async create(userId: number, createWebhookDto: CreateWebhookDto) {
        const events = await this.prisma.event.findMany();
        const selectedEvents = createWebhookDto.events || [];

        // Check if webhook already exists for user
        const existingWebhook = await this.prisma.webhook.findFirst({
            where: { userId }
        });

        if (existingWebhook) {
            // If exists, update it
            return this.update(existingWebhook.id, userId, {
                ...createWebhookDto,
                events: selectedEvents
            });
        }

        return this.prisma.webhook.create({
            data: {
                url: createWebhookDto.url,
                name: createWebhookDto.name,
                isActive: createWebhookDto.isActive,
                userId,
                webhookEvents: {
                    create: events.map((event) => ({
                        event: { connect: { id: event.id } },
                        active: selectedEvents.includes(event.slug),
                    })),
                },
            },
            include: {
                webhookEvents: {
                    include: {
                        event: true,
                    },
                },
            },
        });
    }

    async find(userId: number) {
        return this.prisma.webhook.findFirst({
            where: { userId },
            include: {
                webhookEvents: {
                    include: {
                        event: true,
                    },
                },
            },
        });
    }

    async findOne(id: number, userId: number) {
        return this.prisma.webhook.findFirst({
            where: { id, userId },
            include: {
                webhookEvents: {
                    include: {
                        event: true,
                    },
                },
            },
        });
    }

    async findAllEvents() {
        return this.prisma.event.findMany();
    }

    async update(id: number, userId: number, updateWebhookDto: UpdateWebhookDto) {
        // For now, simple update. Complex event update logic might be needed later if editing events is requested.
        // Assuming updateWebhookDto.events contains slugs of events to be active.

        const updateData: any = {
            url: updateWebhookDto.url,
            name: updateWebhookDto.name,
            isActive: updateWebhookDto.isActive,
        };

        if (updateWebhookDto.events) {
            // First, set all to inactive
            await this.prisma.webhookEvent.updateMany({
                where: { webhookId: id },
                data: { active: false }
            });

            // Then set selected to active
            // We need to find event IDs for the slugs
            const events = await this.prisma.event.findMany({
                where: { slug: { in: updateWebhookDto.events } }
            });

            for (const event of events) {
                await this.prisma.webhookEvent.update({
                    where: {
                        webhookId_eventId: {
                            webhookId: id,
                            eventId: event.id
                        }
                    },
                    data: { active: true }
                });
            }
        }

        const result = await this.prisma.webhook.update({
            where: { id },
            data: updateData,
            include: {
                webhookEvents: {
                    include: {
                        event: true,
                    },
                },
            },
        });

        // Limpar cache de webhooks do usuário
        await this.clearWebhookCache(userId);

        return result;
    }

    async remove(id: number, userId: number) {
        const result = await this.prisma.webhook.delete({
            where: { id },
        });

        await this.clearWebhookCache(userId);

        return result;
    }

    private async clearWebhookCache(userId: number) {
        const pattern = `webhook:${userId}:*`;
        const keys = await this.redis.keys(pattern);

        if (keys.length > 0) {
            await Promise.all(keys.map(key => this.redis.delete(key)));
        }
    }
}
