import { AbstractRepoService, Account } from '@app/database';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService extends AbstractRepoService<Account> {
    protected readonly logger: Logger = new Logger(AccountService.name);
    constructor(
        @InjectRepository(Account)
        protected readonly accountRepo: Repository<Account>,
    ) {
        super(accountRepo);
    }

    // TODO: add method to get account data with password for the authentication service
}
