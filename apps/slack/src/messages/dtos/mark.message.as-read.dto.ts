import { IsExistConversation, IsExistMessage } from "@app/validators";
import { IsNumber, IsPositive } from "class-validator";

class MarkMessage {
    @IsNumber()
    @IsPositive()
    @IsExistMessage()
    message_id: number;

    @IsNumber()
    @IsPositive()
    @IsExistConversation()
    conversation_id: number;
}

export class MarkMessageAsReadDto extends MarkMessage {}

export class MarkMessageAsDeliveredDto extends MarkMessage {}