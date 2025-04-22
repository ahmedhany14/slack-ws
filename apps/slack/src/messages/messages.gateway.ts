import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Inject, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server } from 'socket.io';

// interfaces and dtos
import { IWsAuthenticateRequest } from '@app/auth.common';
import { SocketI } from '../interfaces/socket.client.interface';
import { SendDmMessageDto } from './dtos/send.dm.message.dto';
import { MarkMessageAsDeliveredDto, MarkMessageAsReadDto } from './dtos/mark.message.as-read.dto';
import { FetchConversationMessagesDto } from './dtos/fetch.conversation.messages.dto';

// entities
import { DirectConversation, DirectConversationMessages } from '@app/database';

// guards
import { WsIsYourConversationGuard } from '../common/guards/ws.is.your.conversation.guard';
import { WsIsMessageBelongToConversationGuard } from '../common/guards/ws.is.message.belong.to.conversation.guard';
import { WsAuthGuard } from '../guards/ws.auth.guard';

// decorators
import { ExtractConversationData, WsExtractUserData } from '@app/decorators';

// services
import { MessagesService } from './messages.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';
import { DmsService } from '../dms/dms.service';

// filters
import { WsExceptionsFilter } from '@app/interceptors';

@UseFilters(new WsExceptionsFilter())
@UsePipes(
    new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            const messages = errors.map(
                (error) => `${error.property}: ${Object.values(error.value).join(', ')}`,
            );
            throw new WsException(messages);
        },
    }),
)
@WebSocketGateway(3002, {
    namespace: '/messages',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket'],
    allowEIO3: true,
    pingTimeout: 20000,
    pingInterval: 25000,
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private readonly logger = new Logger(MessagesGateway.name);

    constructor(
        @Inject() private readonly dmsService: DmsService,
        @Inject() private readonly dmsMessagesService: MessagesService,
        @Inject() private readonly wsAuthenticateUserService: WsAuthenticateUserService,
    ) { }

    async handleConnection(client: SocketI) {
        try {
            // user authentication
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);

            this.logger.log('user:messages:', `user:messages:${client.data.user.id}`);

            client.join(`user:messages:${client.data.user.id}`);

            /*
             // OK: emit all unread and mark them as read for the sender
             Some explanations:
             * any unread message can be delivered and undelivered
             * so instead of sending unread and undelivered messages, we can send all unread messages
             * this will guarantee that the sender will receive all unread and undelivered messages
             */
            await this.emitUnreadMessages(client);
        } catch (error) {
            console.log('Connection error', error);
            client.emit('ws_error', {
                message: 'Unexpected error occurred',
            });
            client.disconnect();
        } finally {
            this.logger.log(`Client connected to messages: ${client.id}`);
        }
    }

    private async emitUnreadMessages(client: SocketI) {
        /*
            Logic:
            1) we will fetch all unread messages for user
            2) mark any undelivered messages as delivered
            3) emit to the sender of the message that messages are delivered
            4) emit the unread messages to the user
         */

        // fetch all unread messages for user
        let unreadMessages = await this.dmsMessagesService.find({
            receiver: { id: client.data.user?.id },
        });

        // mark all undelivered messages as delivered
        for (const message of unreadMessages) {
            if (!message.delivered) {
                await this.dmsMessagesService.findOneAndUpdate(
                    { id: message.id },
                    { delivered: true },
                );
                // emit to the sender of the message that messages are delivered
                this.server.to(`user:messages:${message.creator.id}`).emit('delivered:message', {
                    message_id: message.id,
                    conversation_id: message.conversation.id,
                    delivered: true,
                });
                message.delivered = true;
            }
        }

        // emit the unread messages to the user
        this.server.to(`user:messages:${client.data.user?.id}`).emit('unread:messages', {
            messages: unreadMessages,
        });
    }

    handleDisconnect(client: SocketI) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // TODO: Authorize that recipient allows messages from the senders how are not in the friend list
    /**
     * ws event to send a direct message to a user
     * Also, this event will be used to create a new conversation if the conversation does not exist
     * Authenticated users can send messages to each other
     * Friendship is required to send messages TODO:
     * @param sendDmMessageDto
     * @param conversation_initiator
     * @emits receive:direct-message
     */
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('send:direct-message')
    async sendMessage(
        @MessageBody() sendDmMessageDto: SendDmMessageDto,
        @WsExtractUserData('id') conversation_initiator: number,
    ) {
        const conversation = await this.dmsService.findOrCreateDm(
            sendDmMessageDto,
            conversation_initiator,
        );

        await this.dmsService.findOneAndUpdate(
            { id: conversation.id },
            { last_message: sendDmMessageDto.content },
        );

        // FIXME: here is and concurrency issue in last_message
        /*
            while last_messages get updated in the conversation with conversation id, the foreign key conversation in a new message still has the oldest content
         */
        const message = await this.dmsMessagesService.create({
            content: sendDmMessageDto.content,
            conversation,
            creator: { id: conversation_initiator },
            receiver: { id: sendDmMessageDto.conversation_recipient },
        } as DirectConversationMessages);

        // emit the message to the recipient conversation
        this.server
            .to(`user:messages:${sendDmMessageDto.conversation_recipient}`)
            .emit('receive:direct-message', {
                conversation_id: conversation.id,
                conversation_initiator: conversation_initiator,
                conversation_recipient: sendDmMessageDto.conversation_recipient,
                message: message,
            });
    }

    /**
     * an event to mark messages as read
     *
     * This event will be used to mark messages as read
     *
     * @param client
     * @param _markMessageAsReadDto
     * @emits mark:messages-as-read to the recipient
     */
    @UseGuards(WsAuthGuard, WsIsYourConversationGuard, WsIsMessageBelongToConversationGuard)
    @SubscribeMessage('mark:messages-as-read')
    async markMessagesAsRead(
        @ConnectedSocket() client: SocketI,
        @MessageBody() _markMessageAsReadDto: MarkMessageAsReadDto, // form validation
    ) {
        const { user, conversation, message } = client.data;

        const reader_message = await this.dmsMessagesService.findOneAndUpdate(
            { id: message?.id },
            { marked: true },
        );
        const to =
            user?.id === conversation?.conversation_initiator.id
                ? conversation?.conversation_recipient.id
                : conversation?.conversation_initiator.id;

        // emit the message to the recipient conversation
        this.server.to(`user:messages:${to}`).emit('read:message', {
            conversation_id: conversation?.id,
            message_id: message?.id,
            reader_id: user?.id,
            message: reader_message,
        });
    }

    /**
     * Marks a specific message as delivered within a conversation and notifies the recipient.
     *
     * @param {SocketI} client - The connected WebSocket client, containing user, conversation, and message data.
     * @param {MarkMessageAsDeliveredDto} _markMessageAsDeliveredDto - Data Transfer Object used for validating the message mark-as-delivered payload.
     * @return {Promise<void>} Resolves when the message has been marked as delivered and an event is emitted to the recipient.
     */
    @UseGuards(WsAuthGuard, WsIsYourConversationGuard, WsIsMessageBelongToConversationGuard)
    @SubscribeMessage('mark:message-as-delivered')
    async markMessageAsDelivered(
        @ConnectedSocket() client: SocketI,
        @MessageBody() _markMessageAsDeliveredDto: MarkMessageAsDeliveredDto, // form validation
    ) {
        const { user, conversation, message } = client.data;

        const delivered_message = await this.dmsMessagesService.findOneAndUpdate(
            { id: message?.id },
            { delivered: true },
        );

        const to =
            user?.id === conversation?.conversation_initiator.id
                ? conversation?.conversation_recipient.id
                : conversation?.conversation_initiator.id;

        // emit the message to the recipient conversation
        this.server.to(`user:messages:${to}`).emit('delivered:message', {
            conversation_id: conversation?.id,
            message_id: message?.id,
            delivered: true,
            message: delivered_message,
        });
    }


    // TODO: Test the event
    /**
     * an event to fetch all messages for a conversation
     * 
     * This event will be used to fetch all messages for a conversation
     * 
     * @param client Socket client
     * @param _fetchConversationMessagesDto DTO for fetching conversation messages
     */
    @SubscribeMessage('fetch:conversation-messages')
    @UseGuards(WsAuthGuard, WsIsYourConversationGuard)
    async fetchConversationMessages(
        @ConnectedSocket() client: SocketI,
        @MessageBody() _fetchConversationMessagesDto: FetchConversationMessagesDto,
        @ExtractConversationData() conversation: DirectConversation,
    ) {
        this.logger.log(`User is requesting messages for conversation ${client.data.conversation?.id}`);

        const messages = await this.dmsMessagesService.findConversationMessages(conversation, _fetchConversationMessagesDto.page);

        this.server
            .to(`user:messages:${client.data.user?.id}`)
            .emit('fetch:conversation-messages', {
                conversation_id: conversation.id,
                messages: messages.response,
                meta: messages.meta
            });
    }

}
