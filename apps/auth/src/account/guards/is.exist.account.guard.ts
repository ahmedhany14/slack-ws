import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { AccountService } from '../account.service';

@Injectable()
export class IsExistAccountGuard implements CanActivate {
    private readonly logger = new Logger(IsExistAccountGuard.name);

    constructor(
        @Inject()
        private readonly accountService: AccountService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('is exist account Guard canActivate called');

        const request = context.switchToHttp().getRequest();
        const { id } = request;

        const account = await this.accountService.findOne({ id });

        if (!account) {
            this.logger.log('account not found');
            return false;
        }

        this.logger.log('account found');
        return true;
    }
}
