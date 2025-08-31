import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  createApiKey(
    @Req() req: { user: { id: number } },
    @Body() body: CreateApiKeyDto,
  ) {
    return this.apiKeyService.createApiKey(body, req.user.id || 1);
  }

  @Get()
  paginate() {
    return this.apiKeyService.paginate();
  }
}
