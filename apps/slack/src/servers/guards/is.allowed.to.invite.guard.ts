import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { SocketI } from '../../interfaces/socket.client.interface';
import { SendServerInvitationDto } from '../dtos/send.server.invitation.dto';

import { SubscribersService } from '../services/subscribers.service';
import { ServerService } from '../services/server.service';
import { WsException } from '@nestjs/websockets';
import { subscriberRole } from '@app/database';


export class IsAllowedToInviteGuard implements CanActivate {
    private readonly logger: Logger = new Logger(IsAllowedToInviteGuard.name);

    constructor(
        @Inject() private readonly subscribersService: SubscribersService,
        @Inject() private readonly serverService: ServerService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('Checking if user is allowed to invite');
        const client: SocketI = context.switchToWs().getClient();
        const data: SendServerInvitationDto = context.switchToWs().getData(), user = client.data.user;

        const server = await this.serverService.findOne({ id: data.server_id });
        if (!server) throw new WsException('Server not found');

        if (server.visable) {
            this.logger.log('Server is public, user can invite');
            return true;
        }

        const subscriber = await this.subscribersService.findOne({
            server: { id: data.server_id },
            subscriber: { id: user?.id },
        });
        if (!subscriber) throw new WsException('You are not a member of this server');

        if (subscriber.role === subscriberRole.MEMBER) throw new WsException('You are not allowed to invite users');

        return true;
    }
}