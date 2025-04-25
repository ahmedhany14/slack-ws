import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';


import { AbstractEntity } from '../../abstract.entity';
import { ServerChat } from './chat.entity';

@Entity('server_chat_messages')
export class ServerChatMessages extends AbstractEntity<ServerChatMessages> {
    @Column({
        type: 'text',
        nullable: false,
    })
    message: string;

    @ManyToOne(() => ServerChat, (chat) => chat.messages, {
        eager: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    chat: ServerChat;
}