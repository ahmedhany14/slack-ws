import { AbstractRepoService, FriendsInvitations, RequestStatus } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService extends AbstractRepoService<FriendsInvitations> {
    protected readonly logger = new Logger(FriendsService.name);

    constructor(
        @InjectRepository(FriendsInvitations)
        private readonly friendsInvitationsRepository: Repository<FriendsInvitations>,
    ) {
        super(friendsInvitationsRepository);
    }

    async getMyFriends(user_id: number) {
        const friends_i_send_to_them = await this.find({
            sender: { id: user_id },
            request_status: RequestStatus.ACCEPTED,
        });

        const friends_i_receive_from_them = await this.find({
            receiver: { id: user_id },
            request_status: RequestStatus.ACCEPTED,
        });
        return [
            ...friends_i_send_to_them.map((friend) => ({
                id: friend.receiver.id,
                name: friend.receiver.username,
            })),
            ...friends_i_receive_from_them.map((friend) => ({
                id: friend.sender.id,
                name: friend.sender.username,
            })),
        ];
    }

    async findMutualFriends(conversation_initiator: number, conversation_recipient: number) {
        const initiatorFriends = await this.getMyFriends(conversation_initiator);
        const recipientFriends = await this.getMyFriends(conversation_recipient);

        return initiatorFriends.filter((friend) =>
            recipientFriends.some((f) => f.id === friend.id),
        );
    }
}
