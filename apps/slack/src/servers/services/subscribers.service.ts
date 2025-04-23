import { AbstractRepoService } from '@app/database';
import { Subscribers } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SubscribersService extends AbstractRepoService<Subscribers> {

    protected readonly logger: Logger = new Logger(SubscribersService.name);

    constructor(
        @InjectRepository(Subscribers)
        private readonly subscribersRepository: Repository<Subscribers>,
    ) {
        super(subscribersRepository);
    }
}
