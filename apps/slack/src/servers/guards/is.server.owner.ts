import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { RequestI } from '@app/interfaces';
import { ServerService } from '../services/server.service';

@Injectable()
export class IsServerOwner implements CanActivate {
    private readonly logger: Logger = new Logger(IsServerOwner.name);

    constructor(@Inject() private readonly serverService: ServerService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('Checking if user is allowed to update server');

        const request: RequestI = context.switchToHttp().getRequest();

        const server_id = +request.params.server_id;
        const owner = request.user.id;

        const server = await this.serverService.findOne({
            id: server_id,
            owner: { id: owner },
        });
        if (!server) {
            this.logger.warn('User not the owner of the server');
            throw new UnauthorizedException({
                message: 'This action is allowed for server owner only',
                details: 'you are not authorized to access this resource',
            });
        }

        return true;
    }
}
