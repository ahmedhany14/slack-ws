import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestI } from '@app/interfaces';

@Injectable()
export class AllowToUpdateGuard implements CanActivate {
    private readonly logger = new Logger(AllowToUpdateGuard.name);

    // TODO: change Interface to the correct one, based on the usage of this guard
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        this.logger.log('AllowToUpdateGuard canActivate called');

        const request: RequestI = context.switchToHttp().getRequest();

        const owner_id = +request.user.id,
            server = request.server;

        if (!server) throw new NotFoundException('server not founded');
        if (server.owner.id !== owner_id)
            throw new UnauthorizedException('You are not allowed to update this server');

        this.logger.log('server found and owner is valid');

        return true;
    }
}
