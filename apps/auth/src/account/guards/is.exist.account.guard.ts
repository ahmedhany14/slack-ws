import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { AccountService } from '../account.service';
import { IRequestIsExistAccount } from '@app/auth.common/interfaces/request.is.exist.account.interface';

@Injectable()
export class IsExistAccountGuard implements CanActivate {
    private readonly logger = new Logger(IsExistAccountGuard.name);

    constructor(
        @Inject()
        private readonly accountService: AccountService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('is exist account Guard canActivate called');

        const request: IRequestIsExistAccount = context.switchToHttp().getRequest();

        const account = await this.accountService.findOne({
            id: request.account_id,
        });

        if (!account) {
            this.logger.log('account not found');
            return false;
        }

        this.logger.log('account found');
        return true;
    }
}
