import { Entity, Column, JoinColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { randomBytes } from 'crypto';
import { Server } from './server.entity';


@Entity('namespaces')
export class Namespaces extends AbstractEntity<Namespaces> {

    @Column({
        type: 'varchar',
        length: 32,
        nullable: false,
    })
    name: string;


    @Column({
        type: 'varchar',
        unique: true,
        nullable: true
    })
    ns_id: string

    @BeforeInsert()
    generateNsId() {
        const timestamp = Math.floor(Date.now() / 1000);
        const randomSuffix = randomBytes(4).toString('hex');
        this.ns_id = `${timestamp}-${randomSuffix}`;
    }

    @ManyToOne(() => Server, (server) => server.namespaces, {
        eager: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn({ name: 'server_id' })
    server: Server
}