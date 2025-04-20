import { IsExistConversation, IsExistMessage } from "@app/validators";
import { IsNumber, IsPositive } from "class-validator";


export class MarkMessageAsReadDto {

    @IsNumber()
    @IsPositive()
    @IsExistMessage()
    message_id: number;

    @IsNumber()
    @IsPositive()
    @IsExistConversation()
    conversation_id: number;
}