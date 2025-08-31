import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  createApiKey(
    @Req() req: { user: { id: number } },
    @Body() body: CreateApiKeyDto,
  ) {
    return this.apiKeyService.createApiKey(body, req.user.id);
  }

  @Get()
  paginate() {
    return this.apiKeyService.paginate();
  }

  @Patch(':name')
  update(
    @Param('name') name: string,
    @Body() body: UpdateApiKeyDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.apiKeyService.update(name, body, req.user.id);
  }

  @Delete(':name')
  delete(@Param('name') name: string, @Req() req: { user: { id: number } }) {
    return this.apiKeyService.delete(name, req.user.id);
  }
}
