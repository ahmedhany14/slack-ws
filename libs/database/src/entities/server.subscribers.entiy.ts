import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity, Server, Account } from '@app/database';


enum subscriberRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
}

@Entity('subscribers')
export class Subscribers extends AbstractEntity<Subscribers> {

    
    @ManyToOne(() => Account, (account) => account.server_subscriptions, {
        eager: true,
        onDelete: 'CASCADE',    
    })
    @JoinColumn({ name: 'subscriber_id' })
    subscriber: Account;


    @ManyToOne(() => Server, (server) => server.subscribers, {
        eager: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'server_id' })
    server: Server;

    @Column({
        type: 'enum',
        enum: subscriberRole,
        default: subscriberRole.MEMBER,
    })
    role: subscriberRole;
}