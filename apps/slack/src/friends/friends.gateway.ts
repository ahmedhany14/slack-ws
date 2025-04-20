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

// filters
import { WsExceptionsFilter } from '@app/interceptors';

// services
import { FriendsService } from './friends.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';

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
@WebSocketGateway(3003, {
    namespace: '/friends',
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
export class FriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(FriendsGateway.name);

    @WebSocketServer()
    server: Server;

    constructor(
        @Inject() private readonly friendsService: FriendsService,
        @Inject() private readonly wsAuthenticateUserService: WsAuthenticateUserService,

    ) { }
    handleDisconnect(client: SocketI) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    async handleConnection(client: SocketI) {
        try {
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);
            client.join(`user:friends:ws:${client.data.user.id}`);

            // OK: list all friends on connection
            this.emitListFriends(client);

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
            this.logger.log(`Client connected: ${client.id}`);
        }
    }

    private async emitListFriends(client: SocketI) {
        const friends = await this.friendsService.getMyFriends(client.data.user?.id as number);
        this.logger.log(`Emitting friends list to ${client.data.user?.id}`);
        this.logger.log(JSON.stringify(friends));
        this.server.to(`user:friends:ws:${client.data.user?.id}`).emit('friends:list', {
            friends,
        });
    }



    // require emit to the invitation receiver that some user sent an invitation
    @SubscribeMessage('send:friend:invitation')
    async sendFriendInvitation() { }

    // require emit to the invitation sender that some user accepted his invitation
    @SubscribeMessage('accept:friend:invitation')
    async acceptFriendInvitation() { }


    // will be rejected and removed from both sides but without message to the sender 
    // will be done by the request receiver
    @SubscribeMessage('reject:friend:invitation')
    async rejectFriendInvitation() { }

    // will be canceled and removed from both sides but without message to the sender
    // will be done by the request sender
    @SubscribeMessage('cancel:friend:invitation')
    async cancelFriendInvitation() { }


    // will remove the friend also from both sides
    // both sender and receiver can do this
    @SubscribeMessage('remove:friend')
    async removeFriend() { }
}