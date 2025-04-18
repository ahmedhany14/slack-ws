import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@app/database/abstract.entity';
import { DirectConversation } from './direct.conversation.entity';
import { Account } from '../account.entity';


@Entity('direct_conversation_messages')
export class DirectConversationMessages extends AbstractEntity<DirectConversationMessages> {

    @Column({
        type: 'varchar',
        length: 2048
    })
    content: string;

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
} 