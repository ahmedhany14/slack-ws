import {
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Inject,
    Logger,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
} from '@nestjs/common';

import { MessagesService } from './messages.service';

// entities
import { DirectConversation, DirectConversationMessages } from '@app/database';

// guards
import { IsYourConversationGuard } from '../common/guards/is.your.conversation.guard';

// decorators
import { ExtractConversationData } from '@app/decorators';

@Controller('messages')
export class MessagesController {
    private readonly logger: Logger = new Logger(MessagesController.name);

    constructor(
        @Inject()
        private readonly messagesService: MessagesService,
    ) {}

    /**
     * Retrieves messages for a specified conversation based on the provided conversation data and pagination details.
     *
     * @param {DirectConversation} conversation - The conversation data extracted from the request, which includes details about the specific conversation.
     * @param {number} page - The page number for pagination, indicating which set of messages to retrieve.
     * @return {Promise<{response: DirectConversationMessages[], meta: {total: number, page: number, limit: number, totalPages: number, hasMore: boolean}}>}
     */
    @UseGuards(IsYourConversationGuard)
    @Get('all/:conversation_id')
    async getConversationMessages(
        @ExtractConversationData() conversation: DirectConversation,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    ): Promise<{
        response: DirectConversationMessages[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasMore: boolean;
        };
    }> {
        this.logger.log(`User is requesting messages for conversation ${conversation}`);

        return this.messagesService.findConversationMessages(conversation, page);
    }

    /**
     * Handles the deletion of a message identified by its ID.
     *
     * @param {number} message_id - The ID of the message to be deleted.
     * @return {Promise<{response: {message: string}}>} A promise that resolves with an object containing a success message.
     */
    @UseGuards(IsYourConversationGuard)
    @Delete(':conversation_id/:message_id')
    async deleteMessage(@Param('message_id', ParseIntPipe) message_id: number): Promise<{
        response: {
            message: string;
        };
    }> {
        this.logger.log(`User is requesting to delete message, with id ${message_id}`);

        await this.messagesService.findOneAndDelete({
            id: message_id,
        });

        return {
            response: {
                message: 'Message deleted',
            },
        };
    }
}
