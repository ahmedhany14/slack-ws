import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepoService, DirectConversation } from '@app/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendDmMessageDto } from './dtos/send.dm.message.dto';

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


        let combined_conversations = [
            // extract recipient from the conversation started by the user

            ...conversation_started_by_user.map((conversation) => {
                return {
                    id: conversation.id,
                    conversation_recipient: {
                        id: conversation.conversation_recipient.id,
                        username: conversation.conversation_recipient.username,
                    },
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at,
                    last_message: conversation.last_message,
                };
            }),

            ...conversation_started_by_recipient.map((conversation) => {
                return {
                    id: conversation.id,
                    conversation_recipient: {
                        id: conversation.conversation_initiator.id,
                        username: conversation.conversation_initiator.username,
                    },
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at,
                    last_message: conversation.last_message,
                };
            })
            // extract initiator from the conversation started by the recipient
        ]

        // sort the conversations by the updated_at field
        combined_conversations.sort((a, b) => {
            const dateA = new Date(a.updated_at);
            const dateB = new Date(b.updated_at);

            return dateB.getTime() - dateA.getTime();
        });

        return combined_conversations
    }

    async findOrCreateDm(
        sendDmMessageDto: SendDmMessageDto
    ) {
        let directConversation: DirectConversation;

        directConversation = await this.findOne({
            conversation_initiator: { id: sendDmMessageDto.conversation_initiator },
            conversation_recipient: { id: sendDmMessageDto.conversation_recipient }
        }) || await this.findOne({
            conversation_initiator: { id: sendDmMessageDto.conversation_recipient },
            conversation_recipient: { id: sendDmMessageDto.conversation_initiator }
        }) as DirectConversation;

        if (!directConversation) {   // create 
            directConversation = await this.create({
                conversation_initiator: { id: sendDmMessageDto.conversation_initiator },
                conversation_recipient: { id: sendDmMessageDto.conversation_recipient }
            } as DirectConversation);
        }


        return directConversation;
    }
}
