import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { Server } from '@app/database';
import { Subscribers } from './server.subscribers.entiy';

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

    server_subscribtions: Promise<Subscribers[]>;
}
