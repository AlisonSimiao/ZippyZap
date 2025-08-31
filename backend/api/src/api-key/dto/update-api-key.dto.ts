import { EStatusApiKey } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateApiKeyDto {
  @IsOptional()
  @MinLength(3)
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(EStatusApiKey)
  status: EStatusApiKey;

  @IsOptional()
  @IsBoolean()
  generateToken: boolean;
}
