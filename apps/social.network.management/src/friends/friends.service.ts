import { AbstractRepoService } from '@app/database';
import { FriendsInvitations } from '@app/database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

    async addFriend(
        sender_id: number,
        receiver_id: number
    ) {
        const friend_request = await this.create({
            sender: { id: sender_id },
            receiver: { id: receiver_id }
        } as FriendsInvitations);

        return friend_request;
    }
}
