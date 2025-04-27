import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { SocketI } from '../../interfaces/socket.client.interface';
import { WsException } from '@nestjs/websockets';
import { ServerMembersListDto } from '../dtos/server.members.list.dto';
import { SubscribersService } from '../services/subscribers.service';
import { ServerService } from '../services/server.service';
import { subscriberRole } from '@app/database';


export class WsIsServerMemberGuard implements CanActivate {
    private readonly logger: Logger = new Logger(WsIsServerMemberGuard.name);

    constructor(
        @Inject() private readonly subscribersService: SubscribersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('Checking if user is a server member');

        const client: SocketI = context.switchToWs().getClient();
        const data: ServerMembersListDto = context.switchToWs().getData();


        const subscriber = await this.subscribersService.findOne({
            server: { id: data.server_id },
            subscriber: { id: client.data.user?.id },
        });

        if (!subscriber || ![subscriberRole.ADMIN, subscriberRole.MEMBER, subscriberRole.OWNER].includes(subscriber.role)) {
            this.logger.log('User is not a member of the server');
            throw new WsException('You are not a member of this server');
        }

        return true;
    }

}