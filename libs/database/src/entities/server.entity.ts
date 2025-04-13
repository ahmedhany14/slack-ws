import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { Account } from './account.entity';
import { Namespaces } from './namespaces.entity';

@Entity('server')
export class Server extends AbstractEntity<Server> {
    @Column({
        type: 'varchar',
        length: 32,
        nullable: false,
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    description: string;

    @Column({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @ManyToOne(() => Account, (account) => account.servers, {
        eager: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'owner_id' })
    owner: Account;

    @OneToMany(() => Namespaces, (namespaces) => namespaces.server, {
        lazy: true
    })
    namespaces: Promise<Namespaces[]>
}
