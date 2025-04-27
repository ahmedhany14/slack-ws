import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { FriendsService } from '../friends.service';

// entities and interfaces
import { SocketI } from '@app/interfaces/socket.client.interface';
import { AcceptFriendRequestDto } from '../dtos/friend.reques.id.validators.dto';
import { FriendsInvitations, RequestStatus } from '@app/database';


@Injectable()
export class CanYouAcceptOrRejectFriendRequestGuard implements CanActivate {
    constructor(
        @Inject()
        private readonly friendsService: FriendsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: SocketI = context.switchToWs().getClient();
        const data: AcceptFriendRequestDto = context.switchToWs().getData();
        const sender_id = data.sender_id, receiver_id = client.data.user?.id;
        if (sender_id === receiver_id) throw new WsException('You cannot accept a friend request from yourself');

        const friend_request = await this.friendsService.findOne({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.PENDING,
        } as FriendsInvitations);

        if (!friend_request) throw new WsException('You have no pending friend request from this user');
        return true;
    }
}