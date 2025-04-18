import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';


export class CreateNamespaceDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    name: string;
}