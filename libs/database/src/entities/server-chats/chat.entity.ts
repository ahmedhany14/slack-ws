import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import {  Namespaces } from '@app/database';
import { AbstractEntity } from '../../abstract.entity';
import { ServerChatMessages } from './chat.messages.entity';

export enum ChatType {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

@Entity('server_chats')
export class ServerChat extends AbstractEntity<ServerChat> {
    @Column({
        type: 'varchar',
        length: 32,
        nullable: false,
    })
    name: string;

    @Column({
        type: 'enum',
        enum: ChatType,
        default: ChatType.PUBLIC,
    })
    chat_type: ChatType;

    @ManyToOne(() => Namespaces, (namespace) => namespace.chats, {
        eager: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    namespace: Namespaces;

    @OneToMany(() => ServerChatMessages, (messages) => messages.chat, {
        lazy: true,
    })
    messages: Promise<ServerChatMessages>;
}
