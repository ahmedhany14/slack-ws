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
import { SocketI } from '@app/interfaces/socket.client.interface';

// services
import { ServerGatewayService } from '../servers/services/server.gateway.service';
import { ServerChatsGatewayService } from './services/server.chats.gateway.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';
import { IWsAuthenticateRequest } from '@app/auth.common';

// guards
import { WsAuthGuard } from '../guards/ws.auth.guard';
import { WsIsServerOwner } from '../common/guards/ws.is.server.owner.guard';
import { WsIsServerMemberGuard } from '../common/guards/ws.is.server.member.guard';
import { WsIsServerAdminGuard } from '../common/guards/ws.is.server.admin.guard';
import { WsExceptionsFilter } from '@app/interceptors';
import { CreateServerChatDto } from './dtos/create.server.chat.dto';
import { ServerChatService } from './services/server.chat.service';
import { ServerChat } from '@app/database';

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
@WebSocketGateway(3006, {
    namespace: 'server-chats',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class ServerChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private readonly logger = new Logger(ServerChatsGateway.name);

    constructor(
        @Inject()
        private readonly serverGatewayService: ServerGatewayService,
        @Inject()
        private readonly serverChatService: ServerChatService,
        @Inject()
        private readonly ServerChatsGatewayService: ServerChatsGatewayService,
        @Inject()
        private readonly wsAuthenticateUserService: WsAuthenticateUserService,
    ) {}

    async handleConnection(@ConnectedSocket() client: SocketI) {
        try {
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);
            client.join(`user:server-messages:${client.data.user.id}`);

            // TODO: join all his available server chats

            // TODO: Load user server chats metadata and last 20 messages
            await this.handelServerChatMetadata(client);
        } catch (error) {
        } finally {
            this.logger.log(`Client connected to server messages namespace: ${client.id}`);
        }
    }

    async handleDisconnect(@ConnectedSocket() client: SocketI) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    private async handelServerChatMetadata(client: SocketI) {}

    // TODO: Create a server chat
    @UseGuards(WsAuthGuard, WsIsServerAdminGuard)
    @SubscribeMessage('create:server:chat')
    async handleCreateServerChat(
        @ConnectedSocket() client: SocketI,
        @MessageBody() createServerChatDto: CreateServerChatDto,
    ) {
        this.logger.log('Creating a new server chat');

        const chat = await this.serverChatService.create({
            name: createServerChatDto.name,
            namespace: { id: createServerChatDto.namespace_id },
            chat_type: createServerChatDto.chat_type,
        } as ServerChat);

        // TODO: emit to all server members that a new chat has been created, but only authorized members can open it and see, send messages, etc.
        // this.server
        //     .to()
        //     .emit()
    }

    // TODO: Update server chat privacy
    @UseGuards(WsAuthGuard, WsIsServerAdminGuard)
    @SubscribeMessage('update:server:chat')
    async handleUpdateServerChat(){

    }


    // TODO: Delete server chat
    @UseGuards(WsAuthGuard, WsIsServerOwner)
    @SubscribeMessage('delete:server:chat')
    async handleDeleteServerChat(){}

    // TODO: if chat private, add user to server chat
    @UseGuards(WsAuthGuard, WsIsServerAdminGuard)
    @SubscribeMessage('add:user:to:server:chat')
    async handleAddUserToServerChat() {}

    // TODO: Send message to server chat

    // TODO: Delete message from server chat

    // TODO: Edit message from server chat

    // TODO: find server chat messages by page
}
