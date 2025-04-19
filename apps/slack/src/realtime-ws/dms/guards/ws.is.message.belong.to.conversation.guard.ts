import { CanActivate, ConflictException, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DmsService } from '../services/dms.service';
import { SocketI } from '../../interfaces/socket.client.interface';
import { MarkMessageAsReadDto } from '../dtos/mark.message.as-read.dto';
import { DmsMessagesService } from '../services/dms.messages.service';
import { DirectConversation } from '@app/database';


export class WsIsMeassageBelongToConversationGuard implements CanActivate {
    private readonly logger = new Logger(WsIsMeassageBelongToConversationGuard.name);

    constructor(
        @Inject() private readonly dmsMessagesService: DmsMessagesService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        this.logger.log(`checking if message belongs to conversation and can be read`);
        const client: SocketI = context.switchToWs().getClient();
        const data: MarkMessageAsReadDto = context.switchToWs().getData();
        const reader_id = client.data?.user?.id;
        const conversation = client.data?.conversation as DirectConversation;

        const message = await this.dmsMessagesService.findOne({
            id: data.message_id,
            conversation: {
                id: conversation.id,
            }
        });

        if (!message || message.creator.id === reader_id)
            throw new ConflictException(`Message with id ${data.message_id} does not exist or you are the creator of this message`);

        client.data.message = message;
        return true;
    }
}