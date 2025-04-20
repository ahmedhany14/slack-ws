import { MutualFriend } from './mutual.friends.interface';

export interface ConversationMetadataResponseI {
    conversation_id: number;
    mutual_friends: MutualFriend[];
    number_of_mutual_friends: number;
}

export interface MessagesResponseI {
    message: string
}
