import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractRepoService } from '@app/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectConversationMessages } from '@app/database';

@Injectable()
export class DmsMessagesService extends AbstractRepoService<DirectConversationMessages> {
    protected readonly logger: Logger = new Logger(DmsMessagesService.name);
    constructor(
        @InjectRepository(DirectConversationMessages)
        private readonly directConversationMessagesRepository: Repository<DirectConversationMessages>,
    ) {
        super(directConversationMessagesRepository);
    }
}
