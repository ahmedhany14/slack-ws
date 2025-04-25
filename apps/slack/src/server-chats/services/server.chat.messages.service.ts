import { AbstractRepoService, ServerChatMessages } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ServerChatMessagesService extends AbstractRepoService<ServerChatMessages> {

    protected readonly logger = new Logger(ServerChatMessagesService.name);

    constructor(
        @InjectRepository(ServerChatMessages)
        private readonly serverChatMessagesRepository: Repository<ServerChatMessages>,
    ) {
        super(serverChatMessagesRepository);
    }

}
