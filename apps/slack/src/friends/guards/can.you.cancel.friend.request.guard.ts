import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { FriendsService } from '../friends.service';

// entities and interfaces
import { SocketI } from '@app/interfaces/socket.client.interface';
import { CancelFriendRequestDto } from '../dtos/friend.reques.id.validators.dto';
import { FriendsInvitations, RequestStatus } from '@app/database';


@Injectable()
export class CanYouCancelFriendRequestGuard implements CanActivate {
    constructor(
        @Inject()
        private readonly friendsService: FriendsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: SocketI = context.switchToWs().getClient();
        const data: CancelFriendRequestDto = context.switchToWs().getData();

        const sender_id = client.data.user?.id, receiver_id = data.receiver_id;

        if (sender_id === receiver_id) {
            throw new WsException('You cannot cancel a friend request to yourself');
        }


        const is_friend = await this.friendsService.findOne({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.PENDING,
        });

        if (!is_friend) {
            throw new WsException('You cannot cancel a friend request that does not exist');
        }

        return true;
    }
}
