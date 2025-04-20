import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { FriendsService } from '../friends.service';

// entities and interfaces
import { SocketI } from '../../interfaces/socket.client.interface';
import { SendFriendRequestDto } from '../dtos/friend.reques.id.validators.dto';
import { FriendsInvitations, RequestStatus } from '@app/database';


@Injectable()
export class CanYouSendFriendRequestGuard implements CanActivate {
    constructor(
        @Inject()
        private readonly friendsService: FriendsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: SocketI = context.switchToWs().getClient();
        const data: SendFriendRequestDto = context.switchToWs().getData();

        const sender_id = client.data.user?.id, receiver_id = data.receiver_id;

        if (sender_id === receiver_id) {
            throw new WsException('You cannot send a friend request to yourself');
        }


        const is_friend = await this.friendsService.findOne({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
        } as FriendsInvitations) ||
            await this.friendsService.findOne({
                sender: { id: receiver_id },
                receiver: { id: sender_id },
            } as FriendsInvitations);


        if (is_friend &&
            (
                is_friend.request_status === RequestStatus.ACCEPTED
                || is_friend.request_status === RequestStatus.PENDING
            )
        ) {
            if (is_friend.request_status === RequestStatus.ACCEPTED) throw new WsException('You are already friends');
            else throw new WsException("this friend request is already pending see your pending requests or ask the user to accept it");
        }

        return true;
    }
}
