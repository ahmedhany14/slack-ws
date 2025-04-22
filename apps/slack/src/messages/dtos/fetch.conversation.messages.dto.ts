import { IsExistConversation } from "@app/validators";
import { IsNumber, IsOptional, IsPositive } from "class-validator";


export class FetchConversationMessagesDto {

    @IsNumber()
    @IsPositive()
    @IsExistConversation()
    conversation_id: number;


    @IsNumber()
    @IsPositive()
    @IsOptional()
    page?: number
}