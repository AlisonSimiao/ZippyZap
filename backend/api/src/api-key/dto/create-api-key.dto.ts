import { EStatusApiKey } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateApiKeyDto {
  @MinLength(3)
  @IsString()
  name: string;

  @IsEnum(EStatusApiKey)
  status: EStatusApiKey;
}
