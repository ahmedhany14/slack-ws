import { IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";


export class SendDmMessageDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(2048)
    content: string;

    @IsPositive()
    @IsNotEmpty()
    //@IsExistUser() // TODO: add this validator 
    conversation_initiator: number;

    @IsPositive()
    @IsNotEmpty()
    //@IsExistUser() // TODO: add this validator
    conversation_recipient: number;
}