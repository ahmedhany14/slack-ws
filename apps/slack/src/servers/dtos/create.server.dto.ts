import {
    IsBoolean,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';

export class CreateServerDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(32)
    name: string

    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(255)
    description: string

    @IsNotEmpty()
    @IsBoolean()
    visable: boolean
}