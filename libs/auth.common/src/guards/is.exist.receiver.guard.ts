import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { catchError, map, Observable, tap } from 'rxjs';
import { AUTH_SERVICE } from '@app/constants';
import { ClientProxy } from '@nestjs/microservices';
import { RequestI } from '@app/interfaces';
import { IRequestIsExistAccount } from '@app/auth.common/interfaces/request.is.exist.account.interface';

@Injectable()
export class IsExistReceiverGuard implements CanActivate {
    private readonly logger = new Logger(IsExistReceiverGuard.name);

    constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: RequestI = context.switchToHttp().getRequest();

        const auth_request: IRequestIsExistAccount = {
            account_id: request.user.id,
        };

        this.logger.log('IsExistReceiverGuard canActivate called', auth_request);

        return this.authClient
            .send('is-exist-account', {
                auth_request,
            })
            .pipe(
                tap((response) => {
                    console.log('receiver found', response);
                }),
                map((response) => {
                    if (response) {
                        return true;
                    } else {
                        throw new NotFoundException('receiver not found');
                    }
                }),
                catchError((error) => {
                    throw new NotFoundException('receiver not found');
                }),
            );
    }
}
