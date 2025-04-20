import { AbstractRepoService, FriendsInvitations, RequestStatus } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FriendsI } from './interfaces/friends.interfaces';


@Injectable()
export class FriendsService extends AbstractRepoService<FriendsInvitations> {
    protected readonly logger = new Logger(FriendsService.name);

    constructor(
        @InjectRepository(FriendsInvitations)
        private readonly friendsInvitationsRepository: Repository<FriendsInvitations>,
    ) {
        super(friendsInvitationsRepository);
    }

    /**
     * Get all friends for a specific user
     */
    async getMyFriends(userId: number): Promise<FriendsI[]> {
        const [sentInvitations, receivedInvitations] = await Promise.all([
            this.friendsInvitationsRepository.find({
                where: {
                    sender: { id: userId },
                    request_status: RequestStatus.ACCEPTED,
                },
                relations: ['receiver'],
            }),
            this.friendsInvitationsRepository.find({
                where: {
                    receiver: { id: userId },
                    request_status: RequestStatus.ACCEPTED,
                },
                relations: ['sender'],
            }),
        ]);

        return [
            ...this.formatFriends(sentInvitations, 'receiver'),
            ...this.formatFriends(receivedInvitations, 'sender'),
        ] as FriendsI[];
    }

    /**
     * Find mutual friends between two users
     */
    async findMutualFriends(initiatorId: number, recipientId: number): Promise<FriendsI[]> {
        try {
            const [initiatorFriends, recipientFriends] = await Promise.all([
                this.getMyFriends(initiatorId),
                this.getMyFriends(recipientId),
            ]);

            return this.findCommonFriends(initiatorFriends, recipientFriends);
        } catch (error) {
            this.logger.error(
                `Failed to find mutual friends between ${initiatorId} and ${recipientId}`,
                error.stack,
            );
            throw error;
        }
    }

    /**
     * Format Account entities to Friend interface
     */
    private formatFriends(
        friendships: FriendsInvitations[],
        userType: 'sender' | 'receiver',
    ): FriendsI[] {
        return friendships.map((friendship) => ({
            id: friendship[userType].id,
            name: friendship[userType].username,
        }));
    }

    /**
     * Find common friends between two lists
     */
    private findCommonFriends(list1: FriendsI[], list2: FriendsI[]): FriendsI[] {
        const list2Ids = new Set(list2.map((friend) => friend.id));
        return list1.filter((friend) => list2Ids.has(friend.id));
    }
}
