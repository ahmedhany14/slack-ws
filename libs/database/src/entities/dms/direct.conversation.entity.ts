import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract.entity';
import { Account } from '../account.entity';

@Entity('direct_conversations')
export class DirectConversation extends AbstractEntity<DirectConversation> {
    @ManyToOne(() => Account, {
        eager: true,
    })
    @JoinColumn({
        name: 'conversation_initiator_id',
    })
    conversation_initiator: Account; // the user who initiated the conversation

    @ManyToOne(() => Account, { eager: true })
    @JoinColumn({
        name: 'conversation_recipient_id',
    })
    conversation_recipient: Account; // the user who is the recipient of the conversation

    @Column({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @Column({
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    last_message: string; // the last message sent in the conversation
}
