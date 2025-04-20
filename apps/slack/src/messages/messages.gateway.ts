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
// interfaces and dtos
import { IWsAuthenticateRequest } from '@app/auth.common';
import { SocketI } from '../interfaces/socket.client.interface';
import { SendDmMessageDto } from './dtos/send.dm.message.dto';

// entities
import { DirectConversationMessages } from '@app/database';

// guards
import { WsIsYourConversationGuard } from '../common/guards/ws.is.your.conversation.guard';
import { WsIsMeassageBelongToConversationGuard } from '../common/guards/ws.is.message.belong.to.conversation.guard';
import { WsAuthGuard } from '../guards/ws.auth.guard';

// decorators
import { WsExtractUserData } from '@app/decorators';

// services
import { MessagesService } from './messages.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';
import { DmsService } from '../dms/dms.service';

// filters
import { WsExceptionsFilter } from '@app/interceptors';
import { Server } from 'socket.io';
import { MarkMessageAsReadDto } from './dtos/mark.message.as-read.dto';

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
    ) {}

    async handleConnection(client: SocketI) {
        try {
            // user authentication
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);

            this.logger.log('user:messages:', `user:messages:${client.data.user.id}`);

            client.join(`user:messages:${client.data.user.id}`);
        } catch (error) {
            this.logger.log('Connection error');
            client.emit('error', {
                message:
                    error instanceof WsException
                        ? error.getError().toString()
                        : 'Authentication failed',
            });
            client.disconnect();
        } finally {
            this.logger.log(`Client connected to messages: ${client.id}`);
        }
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
            {
                id: conversation.id,
            },
            {
                last_message: sendDmMessageDto.content,
            },
        );

        // FIXME: here is and concurrency issue in last_message
        /*
         while last_messages get updated in the conversation with conversation id, the foreign key conversation in a new message still has the oldest content
         */
        const message = await this.dmsMessagesService.create({
            content: sendDmMessageDto.content,
            conversation,
            creator: { id: conversation_initiator },
        } as DirectConversationMessages);

        // emit the message to the conversation
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
     * @param markMessageAsReadDto
     * @emits mark:messages-as-read to the recipient
     */
    @UseGuards(WsAuthGuard, WsIsYourConversationGuard, WsIsMeassageBelongToConversationGuard)
    @SubscribeMessage('mark:messages-as-read')
    async markMessagesAsRead(
        @ConnectedSocket() client: SocketI,
        @MessageBody() markMessageAsReadDto: MarkMessageAsReadDto // form validation
    ) {
        const { user, conversation, message } = client.data;

        const reader_message = await this.dmsMessagesService.findOneAndUpdate(
            {
                id: message?.id,
            },
            {
                marked: true,
            },
        );

        const to =
            user?.id === conversation?.conversation_initiator.id
                ? conversation?.conversation_recipient.id
                : conversation?.conversation_initiator.id;

        this.server.to(`user:messages:${to}`).emit('mark:messages-as-read', {
            conversation_id: conversation?.id,
            message_id: message?.id,
            reader_id: user?.id,
            message: reader_message,
        });
    }

    // TODO: Fetch Conversation Messages by page (pagination)
    /**
     * an event to fetch all messages for a conversation
     * This event will be used to fetch all messages for a conversation
     * Authenticated users can fetch their conversations
     * @param client
     * @emits conversation:messages
     */
}
