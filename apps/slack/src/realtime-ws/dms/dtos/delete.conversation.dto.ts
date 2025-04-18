import { IsNumber, IsPositive } from "class-validator";
import { IsExistConversation } from "../../validators/is.exist.conversation.validator";

export class DeleteConversationDto {

    @IsNumber()
    @IsPositive()
    @IsExistConversation()
    conversation_id: number;
}