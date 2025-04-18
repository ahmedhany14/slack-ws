import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepoService, DirectConversation } from '@app/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DmsService extends AbstractRepoService<DirectConversation> {
    protected readonly logger: Logger = new Logger(DmsService.name);

    constructor(
        @InjectRepository(DirectConversation)
        private readonly directConversationRepository: Repository<DirectConversation>,
    ) {
        super(directConversationRepository);
    }


    async findAllMyDms(
        user_id: number,
    ) {
        const conversation_started_by_user = await this.find({ // all conversations started by the user to the recipient
            conversation_initiator: { id: user_id },
        });

        const conversation_started_by_recipient = await this.find({ // all conversations started by the recipient to the user
            conversation_recipient: { id: user_id },
        });


        const combined_conversations = [
            // extract recipient from the conversation started by the user

            conversation_started_by_user.map((conversation) => {
                return {
                    id: conversation.id,
                    conversation_recipient: {
                        id: conversation.conversation_recipient.id,
                        username: conversation.conversation_recipient.username,
                    },
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at,
                };
            }),

            conversation_started_by_recipient.map((conversation) => {
                return {
                    id: conversation.id,
                    conversation_recipient: {
                        id: conversation.conversation_initiator.id,
                        username: conversation.conversation_initiator.username,
                    },
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at,
                };
            })
            // extract initiator from the conversation started by the recipient

        ]

        return combined_conversations
    }


}
