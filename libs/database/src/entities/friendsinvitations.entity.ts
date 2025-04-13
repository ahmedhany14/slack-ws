import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { Account } from './account.entity';



@Entity('invitations')
export class FreindsInvitations extends AbstractEntity<FreindsInvitations> {

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