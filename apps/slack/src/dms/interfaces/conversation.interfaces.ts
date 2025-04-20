export interface ConversationParticipantI {
    id: number;
    username: string;
}

export interface FormattedConversationI {
    id: number;
    conversation_recipient: ConversationParticipantI;
    created_at: Date;
    updated_at: Date;
    last_message: string;
}
