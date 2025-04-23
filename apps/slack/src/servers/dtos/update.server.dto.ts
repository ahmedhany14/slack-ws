import { PartialType } from '@nestjs/mapped-types';
import { CreateServerDto } from './create.server.dto';
import { IsBoolean, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { IsExistServer } from '@app/validators';

export class UpdateServerDto extends PartialType(CreateServerDto) {

    @IsPositive()
    @IsNumber()
    @IsExistServer()
    server_id: number
}
