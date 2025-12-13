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
  @Matches(/^((55)?[1-9]{2}[0-9]{8,9})$/, { message: 'Invalid phone number format. Must be (55) + DDD + Number' })
  to: string;

  @IsNotEmpty()
  @IsEnum(EType)
  type: EType;

  @IsNotEmpty()
  @IsString()
  message: string;
}
