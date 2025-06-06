import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';
import { SocketI } from '@app/interfaces';
import { SubscribersService } from '../../servers/services/subscribers.service';
import { subscriberRole } from '@app/database';
import { WsException } from '@nestjs/websockets';


@Injectable()
export class WsIsServerAdminGuard implements CanActivate {
    private readonly logger: Logger = new Logger(WsIsServerAdminGuard.name);

    constructor(
        @Inject() private readonly subscribersService: SubscribersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('Checking if user is allowed to update server');
        const client: SocketI = context.switchToWs().getClient<SocketI>();
        const { server_id } = context.switchToWs().getData();
        const user = client.data.user;

        const subscriber = await this.subscribersService.findOne({
            server: { id: server_id },
            subscriber: { id: user?.id },
        });
        if (subscriber?.role === subscriberRole.MEMBER) throw new WsException("you are not authorized to access this resource");

        return true;
    }
}