import { Inject, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { Server, Socket } from 'socket.io';

// interfaces and dtos
import { IWsAuthenticateRequest } from '@app/auth.common';
import { SocketI } from '../interfaces/socket.client.interface';

// guards
import { WsAuthGuard } from '../guards/ws.auth.guard';

// services
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';
import { DmsService } from './dms.service';

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
@WebSocketGateway(3001, {
    namespace: '/dms',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 20000,
    pingInterval: 25000,
})
export class DmsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private readonly logger = new Logger(DmsGateway.name);

    constructor(
        @Inject() private readonly dmsService: DmsService,
        @Inject() private readonly wsAuthenticateUserService: WsAuthenticateUserService,
    ) { }

    async handleConnection(client: SocketI) {
        try {
            // user authentication
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);
            this.logger.log('user:direct-messages:', `user:direct-messages:${client.data.user.id}`);
            client.join(`user:direct-messages:${client.data.user.id}`);

            // TODO: add the user to the list of connected users
            /*
             Will be implemented in the future
             */

            // TODO: emit the list of connected friends to the user
            /*
             Will be implemented in the future
             */

            // emit conversations to the user
            await this.emitConversations(client);
        } catch (error) {
            this.logger.log('Connection error');
            client.emit('ws_error', {
                message:
                    error instanceof WsException
                        ? error.getError().toString()
                        : 'Authentication failed',
            });
            client.disconnect();
        } finally {
            this.logger.log(`Client connected to dms: ${client.id}`);
        }
    }

    /**
     * emit conversations to the user
     * @param client
     */
    private async emitConversations(client: SocketI) {
        const conversations = await this.dmsService.findAllMyDms(client.data.user?.id as number);
        this.logger.log('emitting conversations to user:', client.data.user?.id);
        this.server.to(`user:direct-messages:${client.data.user?.id}`).emit('my:direct-messages', {
            conversations: conversations,
        });
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * an event to fetch all conversations for the authenticated user,
     * This event will be used to fetch all conversations for the authenticated user
     * Authenticated users can fetch their conversations
     * @param client
     * @emits my:direct-messages
     */
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('find:my-conversations')
    async findMyConversations(@ConnectedSocket() client: SocketI) {
        const conversations = await this.dmsService.findAllMyDms(client.data.user?.id as number);

        this.logger.log(`fetching conversations for user: ${client.data.user?.id}`);

        this.server.to(`user:direct-messages:${client.data.user?.id}`).emit('my:direct-messages', {
            conversations: conversations,
        });
    }
}
