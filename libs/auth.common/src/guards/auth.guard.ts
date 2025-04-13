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

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        this.logger.log('AuthGuard canActivate called');
        const request = context.switchToHttp().getRequest();

        const jwt = request.headers.authorization;
        if (!jwt) throw new UnauthorizedException('You are not authorized to access this resource');

        return this.authClient.send('authenticate', { Authentication: jwt }).pipe(
            tap((response) => {
                context.switchToHttp().getRequest().user = response;
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
                throw new UnauthorizedException('You are not authorized to access this resource');
            }),
        );
    }
}
