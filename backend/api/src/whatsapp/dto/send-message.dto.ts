import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

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
    to: string

    @IsNotEmpty()
    @IsEnum(EType)
    type: EType

    @IsNotEmpty()
    @IsString()
    message: string
}
