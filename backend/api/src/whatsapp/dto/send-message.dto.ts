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
    @Matches(/^[1-9]{2}9[0-9]{8}$/, { message: 'Invalid phone number format' })
    to: string

    @IsNotEmpty()
    @IsEnum(EType)
    type: EType

    @IsNotEmpty()
    @IsString()
    message: string
}
