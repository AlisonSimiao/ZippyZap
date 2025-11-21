import { IsMobilePhone, IsNotEmpty, IsPassportNumber, IsString } from 'class-validator';

export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    @IsMobilePhone('pt-BR')
    phone: string;

    @IsString()
    @IsNotEmpty()
    text: string;
}
