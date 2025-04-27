import { ChatType } from '@app/database';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';
import { IsExistServer } from '@app/validators';


export class CreateServerChatDto {
    @IsString ()
    @IsNotEmpty()
    @MaxLength(32)
    name: string

    @IsEnum(ChatType)
    chat_type: ChatType

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    namespace_id: number

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @IsExistServer()
    server_id: number
}