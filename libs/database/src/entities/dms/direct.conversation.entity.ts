import { Entity, ManyToOne, Column, JoinColumn, OneToMany, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { AbstractEntity } from '../../abstract.entity';
import { Account } from '../account.entity';
import { DirectConversationMessages } from './direct.conversations.messges.entity';

@Entity('direct_conversations')
export class DirectConversation extends AbstractEntity<DirectConversation> {

    // TODO: add the last message sent in the conversation to appear in the list of conversations
    @Column({
        type: 'varchar',
        length: 2048,
        nullable: true
    })
    last_message: string;

    @CreateDateColumn({
        type: 'timestamp with time zone'
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp with time zone'
    })
    updated_at: Date;


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

    @OneToMany(() => DirectConversationMessages, (dms) => dms.conversation, {
        lazy: true
    })
    messages: Promise<DirectConversationMessages[]>
}
