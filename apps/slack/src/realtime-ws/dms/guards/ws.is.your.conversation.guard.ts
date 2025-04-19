import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { DmsService } from '../services/dms.service';
import { SocketI } from '../../interfaces/socket.client.interface';
import { MarkMessageAsReadDto } from '../dtos/mark.message.as-read.dto';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsIsYourConversationGuard implements CanActivate {
    private readonly logger = new Logger(WsIsYourConversationGuard.name);

    constructor(
        @Inject() private readonly dmsService: DmsService,
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const client: SocketI = context.switchToWs().getClient();
        const data: MarkMessageAsReadDto = context.switchToWs().getData();
        const reader_id = client.data?.user?.id;



        const conversation = await this.dmsService.findOne({
            id: data.conversation_id,
            conversation_initiator: { id: reader_id },
        }) || await this.dmsService.findOne({
            id: data.conversation_id,
            conversation_recipient: { id: reader_id },
        });

        if (!conversation)
            throw new WsException(`Conversation with id ${data.conversation_id} does not exist or you are not a participant of this conversation`);
        client.data.conversation = conversation;
        return true;
    }
}
