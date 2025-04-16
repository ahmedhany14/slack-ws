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

@Injectable()
export class IsExistReceiverGuard implements CanActivate {
    private readonly logger = new Logger(IsExistReceiverGuard.name);

    constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        console.log('IsExistReceiverGuard');

        const request: RequestI = context.switchToHttp().getRequest();

        const receiver_id = +request.params.receiver_id;

        console.log('reciver_id', receiver_id);

        return this.authClient
            .send('is-exist-account', {
                receiver_id
            })
            .pipe(
                tap((response) => {
                    console.log('reciver found', response);
                }),
                map((response) => {
                    if (response) {
                        return true;
                    } else {
                        throw new NotFoundException('Reciver not found');
                    }
                }),
                catchError((error) => {
                    throw new NotFoundException('Reciver not found');
                }),
            );
    }
}
