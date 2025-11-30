import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWebhookDto {
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    events?: string[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
