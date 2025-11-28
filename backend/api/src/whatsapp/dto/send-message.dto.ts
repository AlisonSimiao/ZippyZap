import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

enum EType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[1-9]{2}[0-9]{8,9}$/, { message: 'Invalid phone number format. Must be DDD + Number (10 or 11 digits)' })
  to: string;

  @IsNotEmpty()
  @IsEnum(EType)
  type: EType;

  @IsNotEmpty()
  @IsString()
  message: string;
}
