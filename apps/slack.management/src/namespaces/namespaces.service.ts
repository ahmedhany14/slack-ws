import { AbstractRepoService } from '@app/database';
import { Namespaces } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NamespacesService extends AbstractRepoService<Namespaces> {
    protected readonly logger: Logger = new Logger(NamespacesService.name);
    constructor(
        @InjectRepository(Namespaces)
        private readonly namespacesRepository: Repository<Namespaces>,
    ) {
        super(namespacesRepository);
    }
}
