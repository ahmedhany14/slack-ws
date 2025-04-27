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
import { SocketI } from '@app/interfaces/socket.client.interface';
import { AcceptFriendRequestDto, SendFriendRequestDto, RejectFriendRequestDto, CancelFriendRequestDto } from './dtos/friend.reques.id.validators.dto';
import { FriendsInvitations, RequestStatus } from '@app/database';

// filters
import { WsExceptionsFilter } from '@app/interceptors';

// services
import { FriendsService } from './friends.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';

// guards
import { WsAuthGuard } from '../guards/ws.auth.guard';
import { CanYouSendFriendRequestGuard } from './guards/can.you.send.friend.request.guard';
import { CanYouAcceptOrRejectFriendRequestGuard } from './guards/can.you.accept.or.reject.friend.request.guard';
import { CanYouCancelFriendRequestGuard } from './guards/can.you.cancel.friend.request.guard';

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
            client.join(`user:friends:request:ws:${client.data.user.id}`);

            // OK: list all friends on connection
            this.emitListFriends(client);

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
    @UseGuards(WsAuthGuard, CanYouSendFriendRequestGuard)
    @SubscribeMessage('send:friend:request')
    async sendFriendInvitation(
        @ConnectedSocket() client: SocketI,
        @MessageBody() sendFriendRequestDto: SendFriendRequestDto,
    ) {
        this.logger.log(`sending friend request from ${client.data.user?.id} to ${sendFriendRequestDto.receiver_id}`);
        const sender_id = client.data.user?.id as number,
            receiver_id = sendFriendRequestDto.receiver_id;


        const friend_request = await this.friendsService.create({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
        } as FriendsInvitations)

        this.server
            .to(`user:friends:request:ws:${sendFriendRequestDto.receiver_id}`) // send to the receiver
            .emit('friend:request:received', {
                message: `You have a new friend request from ${client.data.user?.username}`,
                friend_request,
            })
    }

    // require emit to the invitation sender that some user accepted his invitation
    @UseGuards(WsAuthGuard, CanYouAcceptOrRejectFriendRequestGuard)
    @SubscribeMessage('friend:accept:request')
    async acceptFriendInvitation(
        @ConnectedSocket() client: SocketI,
        @MessageBody() acceptFriendRequestDto: AcceptFriendRequestDto,
    ) {
        this.logger.log(`accepting friend request from ${client.data.user?.id} to ${acceptFriendRequestDto.sender_id}`);
        const sender_id = acceptFriendRequestDto.sender_id,
            receiver_id = client.data.user?.id as number;


        let accepted_request = await this.friendsService.findOneAndUpdate({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.PENDING
        }, {
            request_status: RequestStatus.ACCEPTED
        });
        accepted_request = await this.friendsService.findOne({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.ACCEPTED
        } as FriendsInvitations);

        // emit senders that the request was accepted
        this.server
            .to(`user:friends:request:ws:${acceptFriendRequestDto.sender_id}`) // send to the sender
            .emit('friend:request:accepted', {
                message: `Your friend request was accepted by ${client.data.user?.username}`,
                friend_request: accepted_request,
            })

        // OK: emit to the sender that the request was accepted, and request data to make client remove it from pending list and add the friend to the list
        // emit to the user that he accepted the request
        this.server
            .to(`user:friends:request:ws:${receiver_id}`) // send to the receiver
            .emit('friend:request:accepted', {
                message: `You accepted the friend request from ${accepted_request?.receiver?.username}`,
                friend_request: accepted_request,
            });

    }


    // will be rejected and removed from both sides but without message to the sender 
    // will be done by the request receiver
    @UseGuards(WsAuthGuard, CanYouAcceptOrRejectFriendRequestGuard)
    @SubscribeMessage('friend:reject:request')
    async rejectFriendInvitation(
        @ConnectedSocket() client: SocketI,
        @MessageBody() rejectFriendRequestDto: RejectFriendRequestDto,
    ) {
        const sender_id = rejectFriendRequestDto.sender_id,
            receiver_id = client.data.user?.id as number;
        this.logger.log(`rejecting friend request from ${client.data.user?.id} to ${rejectFriendRequestDto.sender_id}`);

        await this.friendsService.findOneAndUpdate({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.PENDING
        }, {
            request_status: RequestStatus.REJECTED
        });

        const reject_request = await this.friendsService.findOne({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.REJECTED
        } as FriendsInvitations);

        // emit to the user that he rejected the request
        this.server
            .to(`user:friends:request:ws:${receiver_id}`)
            .emit('friend:request:rejected', {
                message: `you rejected the friend request from ${client.data.user?.username}`,
                reject_request,
            })

        // OK: emit to the sender that the request was rejected, and request data to make client remove it from pending list
        // emit to the sender that the request was rejected

        this.server
            .to(`user:friends:request:ws:${sender_id}`) // send to the sender
            .emit('friend:request:rejected', {
                message: `Your friend request was rejected by ${client.data.user?.username}`,
                reject_request,
            });

    }

    // will be canceled and removed from both sides but without message to the sender
    // will be done by the request sender
    @UseGuards(WsAuthGuard, CanYouCancelFriendRequestGuard)
    @SubscribeMessage('friend:cancel:request')
    async cancelFriendInvitation(
        @ConnectedSocket() client: SocketI,
        @MessageBody() cancelFriendRequestDto: CancelFriendRequestDto,
    ) {
        const sender_id = client.data.user?.id as number,
            receiver_id = cancelFriendRequestDto.receiver_id;
        this.logger.log(`canceling friend request from ${client.data.user?.id} to ${cancelFriendRequestDto.receiver_id}`);

        await this.friendsService.findOneAndUpdate({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.PENDING
        }, {
            request_status: RequestStatus.CANCELED
        });

        const canceled_request = await this.friendsService.findOne({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.CANCELED
        } as FriendsInvitations);

        // emit to the user that he canceled the request
        this.server
            .to(`user:friends:request:ws:${sender_id}`)
            .emit('friend:request:canceled', {
                message: `You canceled the friend request you sent`
            })
        // OK: emit to the receiver that the request was canceled, and request data to make client remove it from pending list

        // emit to the receiver that request canceled
        this.server
            .to(`user:friends:request:ws:${receiver_id}`) // send to the receiver
            .emit('friend:request:canceled', {
                message: `Your friend request was canceled by ${canceled_request?.sender.username}`,
                canceled_request
            });
    }

    // will remove the friend also from both sides
    // both sender and receiver can do this
    @SubscribeMessage('friend:remove')
    async removeFriend() { }
}