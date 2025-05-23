import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';
import { WsException } from '@nestjs/websockets';
import { SocketI } from '@app/interfaces/socket.client.interface';

@Injectable()
export class WsAuthGuard implements CanActivate {

    constructor(
        @Inject() private readonly wsAuthenticateUserService: WsAuthenticateUserService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const client: SocketI = context.switchToWs().getClient();

        const response = await this.wsAuthenticateUserService.authenticate({
            token: this.wsAuthenticateUserService.extractToken(client),
        });

        if (!response) {
            throw new WsException('Unauthorized: Invalid token');
        }

        client.data.user = response;
        return true;
    }
}
