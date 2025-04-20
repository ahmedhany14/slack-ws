import { IsExistUser } from "@app/validators";
import { IsNotEmpty, IsPositive, IsString, MaxLength } from "class-validator";


export class SendDmMessageDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(2048)
    content: string;

    @IsPositive()
    @IsNotEmpty()
    @IsExistUser() // DONE: add this validator
    conversation_recipient: number;
}