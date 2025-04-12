import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';


export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @MinLength(8)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @MinLength(8)
    password: string;
}