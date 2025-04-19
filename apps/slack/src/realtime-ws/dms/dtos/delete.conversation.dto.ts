import { IsNumber, IsPositive } from "class-validator";
import { IsExistConversation } from "@app/validators";

export class DeleteConversationDto {

    @IsNumber()
    @IsPositive()
    @IsExistConversation()
    conversation_id: number;
}