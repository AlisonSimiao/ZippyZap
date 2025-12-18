import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { User } from '@prisma/client';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(
    @Body() createWebhookDto: CreateWebhookDto,
    @Req() req: Request & { user: User },
  ) {
    return this.webhookService.create(req.user.id, createWebhookDto);
  }

  @Get('events')
  findAllEvents() {
    return this.webhookService.findAllEvents();
  }

  @Get()
  find(@Req() req: Request & { user: User }) {
    return this.webhookService.find(req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWebhookDto: UpdateWebhookDto,
    @Req() req: Request & { user: User },
  ) {
    return this.webhookService.update(+id, req.user.id, updateWebhookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
    return this.webhookService.remove(+id, req.user.id);
  }
}
