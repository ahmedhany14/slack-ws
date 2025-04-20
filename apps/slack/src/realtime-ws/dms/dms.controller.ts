import {
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    Param,
    UseGuards,
    Logger,
    Inject,
    Query,
    ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';

// guards
import { AuthGuard } from '@app/auth.common';

// decorators
import { ExtractUserData, ExtractConversationData } from '@app/decorators';

// services
import { DmsService } from './services/dms.service';
import { DeleteConversationDto } from './dtos/delete.conversation.dto';
import { DirectConversation, DirectConversationMessages } from '@app/database';
import { IsYourConversationGuard } from './guards/is.your.conversation.guard';
import { DmsMessagesService } from './services/dms.messages.service';

@UseGuards(AuthGuard)
@Controller('dms')
export class DmsController {
    private readonly logger: Logger = new Logger(DmsController.name);

    constructor(
        @Inject()
        private readonly dmsService: DmsService,
        @Inject()
        private readonly dmsMessagesService: DmsMessagesService,
    ) {}

    /**
     * Retrieves all conversations associated with the given user ID.
     *
     * @param {number} id - The unique identifier of the user.
     * @return {Promise<{ response: { conversations: { id: number; conversation_recipient: { id: number; username: string; }; created_at: Date; updated_at: Date; last_message: string; } }[] } | {}>} - A promise that resolves to an object containing the user's conversations.
     */
    @Get()
    async getMyConversations(@ExtractUserData('id') id: number): Promise<
        | {
              response: {
                  conversations: {
                      id: number;
                      conversation_recipient: {
                          id: number;
                          username: string;
                      };
                      created_at: Date;
                      updated_at: Date;
                      last_message: string;
                  };
              }[];
          }
        | {}
    > {
        this.logger.log(`User ${id} is requesting all his conversations`);

        const conversations = await this.dmsService.findAllMyDms(id);
        return {
            response: {
                conversations,
            },
        };
    }

    /**
     * Deletes a specific conversation based on its identifier.
     * Validates that the conversation ID provided in the request body matches the one in the URL.
     *
     * @param {number} conversation_id The ID of the conversation to delete, provided in the URL parameter.
     * @param {DeleteConversationDto} deleteConversationDto The data transfer object for deleting a conversation containing the conversation ID.
     * @return {Promise<{response: {message: string}}>} A promise resolving to an object with a response containing a success message.
     * @throws {ConflictException} If the conversation ID in the request body does not match the conversation ID in the URL.
     */
    @UseGuards(IsYourConversationGuard)
    @Delete(':conversation_id')
    async deleteConversation(
        @Param('conversation_id', ParseIntPipe) conversation_id: number,
        @Body() deleteConversationDto: DeleteConversationDto,
    ): Promise<{
        response: {
            message: string;
        };
    }> {
        this.logger.log(`User is requesting to delete conversation ${conversation_id}`);

        if (deleteConversationDto.conversation_id !== conversation_id) {
            throw new ConflictException({
                message:
                    'Conversation id in the body does not match the conversation id in the url',
            });
        }

        await this.dmsService.findOneAndDelete({
            id: conversation_id,
        });

        return {
            response: {
                message: 'Conversation deleted',
            },
        };
    }

    /**
     * Retrieves metadata about a specific conversation including mutual friends between the participants.
     *
     * @param {DirectConversation} conversation - The direct conversation data extracted with participant details.
     * @return {Promise<{response: {conversation_id: number, mutual_friends: {id: number, name: string}[]}}>}
     *         A promise resolving an object containing the conversation ID and a list of mutual friends.
     */
    @UseGuards(IsYourConversationGuard)
    @Get('metadata/:conversation_id')
    async getConversationMetadata(
        @ExtractConversationData() conversation: DirectConversation,
    ): Promise<{
        response: {
            conversation_id: number;
            mutual_friends: {
                id: number;
                name: string;
            }[];
            number_of_mutual_friends: number;
        };
    }> {
        this.logger.log(`User is requesting metadata for conversation ${conversation.id}`);
        const { conversation_initiator, conversation_recipient } = conversation;
        const mutual_friends = await this.dmsService.findMutualFriends(
            conversation_initiator.id,
            conversation_recipient.id,
        );

        return {
            response: {
                conversation_id: conversation.id,
                mutual_friends,
                number_of_mutual_friends: mutual_friends.length,
            },
        };
    }

    /**
     * Retrieves messages for a specified conversation based on the provided conversation data and pagination details.
     *
     * @param {DirectConversation} conversation - The conversation data extracted from the request, which includes details about the specific conversation.
     * @param {number} page - The page number for pagination, indicating which set of messages to retrieve.
     * @return {Promise<{response: DirectConversationMessages[], meta: {total: number, page: number, limit: number, totalPages: number, hasMore: boolean}}>}
     */
    @UseGuards(IsYourConversationGuard)
    @Get('messages/:conversation_id')
    async getConversationMessages(
        @ExtractConversationData() conversation: DirectConversation,
        @Query('page',new DefaultValuePipe(1) ,ParseIntPipe) page: number,
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

        return this.dmsMessagesService.findConversationMessages(conversation, page);
    }

    /**
     * Handles the deletion of a message identified by its ID.
     *
     * @param {number} message_id - The ID of the message to be deleted.
     * @return {Promise<{response: {message: string}}>} A promise that resolves with an object containing a success message.
     */
    @UseGuards(IsYourConversationGuard)
    @Delete('message/:conversation_id/:message_id')
    async deleteMessage(@Param('message_id', ParseIntPipe) message_id: number): Promise<{
        response: {
            message: string;
        };
    }> {
        this.logger.log(`User is requesting to delete message, with id ${message_id}`);

        await this.dmsMessagesService.findOneAndDelete({
            id: message_id,
        });

        return {
            response: {
                message: 'Message deleted',
            },
        };
    }
}
