import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepoService, DirectConversation } from '@app/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectConversationMessages } from '@app/database';

@Injectable()
export class MessagesService extends AbstractRepoService<DirectConversationMessages> {
    protected readonly logger: Logger = new Logger(MessagesService.name);
    constructor(
        @InjectRepository(DirectConversationMessages)
        private readonly directConversationMessagesRepository: Repository<DirectConversationMessages>,
    ) {
        super(directConversationMessagesRepository);
    }

    async findConversationMessages(
        conversation: DirectConversation,
        page?: number,
    ) {
        const messages = await this.paginate(
            {
                conversation: { id: conversation.id },
            },
            `http://localhost:3000/dms/messages/${conversation.id}`,
            page ?? 1,
            100,
        );

        // sort messages by created_at, newest first
        messages.response.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        return messages;
    }
}
