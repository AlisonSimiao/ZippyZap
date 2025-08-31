import { EStatusApiKey } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateApiKeyDto {
  @IsOptional()
  @MinLength(3)
  @IsString()
  name?: string;

  @IsEnum(EStatusApiKey)
  status: EStatusApiKey;
}
