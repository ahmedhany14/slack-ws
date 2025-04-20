import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { Server } from '@app/database';
import { Subscribers } from './server.subscribers.entiy';
import { FriendsInvitations } from './friends.invitations.entity';
import { DirectConversationMessages } from './dms/direct.conversations.messges.entity';

@Entity('account')
export class Account extends AbstractEntity<Account> {
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        unique: true,
    })
    username: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        select: false,
    })
    password: string;

    @OneToMany(() => Server, (server) => server.owner, {
        lazy: true,
    })
    servers: Promise<Server[]>;

    @OneToMany(() => Subscribers, (subscribers) => subscribers.subscriber, {
        lazy: true,
        onDelete: 'CASCADE',
    })
    server_subscriptions: Promise<Subscribers[]>;

    // will use to get add request I made
    @OneToMany(() => FriendsInvitations, (invitations) => invitations.sender, {
        lazy: true,
        onDelete: 'CASCADE',
    })
    add_request: Promise<FriendsInvitations[]>

    //will use to get add request I received
    @OneToMany(() => FriendsInvitations, (invitations) => invitations.receiver, {
        lazy: true,
        onDelete: 'CASCADE',
    })
    friend_requests: Promise<FriendsInvitations[]>;

    @OneToMany(() => DirectConversationMessages, (dms) => dms.creator) // user dms massages sent by him
    created_messages: Promise<DirectConversationMessages[]>

    @OneToMany(() => DirectConversationMessages, (dms) => dms.receiver) // user dms massages sent to him
    received_messages: Promise<DirectConversationMessages[]>
}
