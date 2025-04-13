import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { Server } from '@app/database';
import { Subscribers } from './server.subscribers.entiy';
import { FreindsInvitations } from './friendsinvitations.entity';

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


    @OneToMany(() => FreindsInvitations, (invitations) => invitations.sender, { // will used to get add request i made 
        lazy: true,
        onDelete: 'CASCADE',
    })
    add_request: Promise<FreindsInvitations[]>

    @OneToMany(() => FreindsInvitations, (invitations) => invitations.receiver, { // will used to get add request i received
        lazy: true,
        onDelete: 'CASCADE',
    })
    friend_requests: Promise<FreindsInvitations[]>;
}
