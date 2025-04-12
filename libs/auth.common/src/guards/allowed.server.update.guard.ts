import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { catchError, map, Observable, tap } from 'rxjs';
import { AUTH_SERVICE } from '@app/constants';
import { ClientProxy } from '@nestjs/microservices';
import { RequestI } from '@app/interfaces';

@Injectable()
export class AllowedServerUpdateGuard implements CanActivate {

    constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        console.log('AllowedServerUpdateGuard');

        const request: RequestI = context.switchToHttp().getRequest();

        return this.authClient
            .send('authorized-to-update', {
                server: request.server,
                user: request.user,
            })
            .pipe(
                tap((response) => {
                    console.log(
                        'your are authorized',
                        response.server.owner.id === request.user.id,
                    );
                }),
                map((response) => {
                    if (response) {
                        return true;
                    } else {
                        throw new UnauthorizedException(
                            'You are not authorized to access this resource',
                        );
                    }
                }),
                catchError((error) => {
                    throw new UnauthorizedException(
                        'You are not authorized to access this resource',
                    );
                }),
            );
    }
}
