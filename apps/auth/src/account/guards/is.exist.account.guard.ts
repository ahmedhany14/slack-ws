import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccountService } from '../account.service';

@Injectable()
export class IsExistAccountGuard implements CanActivate {

    constructor(
        @Inject()
        private readonly accountService: AccountService
    ) {
    }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        console.log('IsExistAccountGuard');

        const request = context.switchToHttp().getRequest();
        const { receiver_id } = request;

        const account = await this.accountService.findOne({ id: receiver_id });

        if (!account) {
            console.log('reciver not found');
            return false;
        }

        return true;
    }
}
