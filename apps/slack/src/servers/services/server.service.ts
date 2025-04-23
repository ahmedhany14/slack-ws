import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepoService, Server } from '@app/database';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ServerService extends AbstractRepoService<Server> {
    protected readonly logger: Logger = new Logger(ServerService.name);

    constructor(
        @InjectRepository(Server)
        private readonly serverRepository: Repository<Server>,
    ) {
        super(serverRepository);
    }
}
