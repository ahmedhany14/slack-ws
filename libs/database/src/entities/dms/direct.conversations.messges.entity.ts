import { AbstractEntity } from '@app/database/abstract.entity';
import { DirectConversation } from './direct.conversation.entity';
import { Account } from '../account.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';


@Entity('direct_conversation_messages')
export class DirectConversationMessages extends AbstractEntity<DirectConversationMessages> {


    @Column({
        type: 'varchar',
        length: 2048
    })
    content: string;


    @Column({
        type: 'boolean',
        default: false,
    })
    marked: boolean;

    @Column({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @Column({
        type: 'timestamp with time zone',
        nullable: true,
        default: null
    })
    updated_at: Date;


    @ManyToOne(() => Account, (account) => account.messages, {
        eager: true,
    })
    @JoinColumn({
        name: 'creator_id',
        referencedColumnName: 'id'
    })
    creator: Account // m:1

    @ManyToOne(() => DirectConversation, (dm) => dm.messages, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({
        name: 'conversation_id',
        referencedColumnName: 'id'
    })
    conversation: DirectConversation; // m:1
} 