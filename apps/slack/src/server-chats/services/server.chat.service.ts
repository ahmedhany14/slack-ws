import { AbstractRepoService, ServerChat } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class ServerChatService extends AbstractRepoService<ServerChat> {
    protected readonly logger = new Logger(ServerChatService.name);

    constructor(
        @InjectRepository(ServerChat)
        private readonly serverChatRepository: Repository<ServerChat>,
    ) {
        super(serverChatRepository);
    }
}
