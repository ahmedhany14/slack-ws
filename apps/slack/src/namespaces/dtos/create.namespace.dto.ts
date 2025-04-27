import { IsExistServer } from '@app/validators';
import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Length,
    MaxLength,
} from 'class-validator';


export class CreateNamespaceDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    name: string;

    @IsNumber()
    @IsPositive()
    @IsExistServer()
    server_id: number;
}