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

    // TODO: Make this field non-selectable in the future
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
    server_subscribtions: Promise<Subscribers[]>;


    @OneToMany(() => FriendsInvitations, (invitations) => invitations.sender, { // will used to get add request i made 
        lazy: true,
        onDelete: 'CASCADE',
    })
    add_request: Promise<FriendsInvitations[]>

    @OneToMany(() => FriendsInvitations, (invitations) => invitations.receiver, { // will used to get add request i received
        lazy: true,
        onDelete: 'CASCADE',
    })
    friend_requests: Promise<FriendsInvitations[]>;

    @OneToMany(() => DirectConversationMessages, (dmsm) => dmsm.creator) // user dms massages sended by him
    messages: Promise<DirectConversationMessages[]>
}
