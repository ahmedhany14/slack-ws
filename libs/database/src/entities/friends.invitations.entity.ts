import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { Account } from './account.entity';


enum RequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected'
}

/**
 * Friends invitations entity
 * @class FriendsInvitations
 * @extends AbstractEntity
 * @property {string} request_status - The status of the friend request
 * @property {Account} sender - The account that sent the friend request
 * @property {Account} receiver - The account that received the friend request
 */
@Entity('friends_invitations')
export class FriendsInvitations extends AbstractEntity<FriendsInvitations> {

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING,
        nullable: false
    })
    request_status: RequestStatus

    @ManyToOne(() => Account, (account) => account.add_request, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'sender_id',
        referencedColumnName: 'id'
    })
    sender: Account


    @ManyToOne(() => Account, (account) => account.friend_requests, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'receiver_id',
        referencedColumnName: 'id'
    })
    receiver: Account
}