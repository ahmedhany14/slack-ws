import { AbstractRepoService, Account } from '@app/database';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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

    // DONE: add method to get account data with password for the authentication service
    async findWithSensitiveData(username: string): Promise<Account | null> {
        try {
            return this.accountRepo.findOne({
                where: { username },
                select: ['id', 'username', 'password'],
            });
        } catch (error) {
            this.logger.error(`Error finding account with id ${username}`, error);
            throw new InternalServerErrorException({
                message: 'Error finding account',
                details: error.message,
            });
        }
    }
}
