import {
    CanActivate,
    ExecutionContext,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestI } from '@app/interfaces';

@Injectable()
export class AllowToUpdateGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: RequestI = context.switchToHttp().getRequest();

        const owner_id = +request.user.id,
            server = request.server;

        if (!server) throw new NotFoundException('server not founded');
        if (server.owner.id !== owner_id)
            throw new UnauthorizedException('You are not allowed to update this server');
        return true;
    }
}
