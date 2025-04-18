import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RealtimeWsAuthService } from '../realtime-ws.auth.service';
import { WsException } from '@nestjs/websockets';
import { SocketI } from '../interfaces/socket.client.interface';

@Injectable()
export class WsAuthGuard implements CanActivate {

    constructor(
        @Inject() private readonly realtimeWsAuthService: RealtimeWsAuthService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const client: SocketI = context.switchToWs().getClient();

        const response = await this.realtimeWsAuthService.authenticate({
            token: this.realtimeWsAuthService.extractToken(client),
        });

        if (!response) {
            throw new WsException('Unauthorized: Invalid token');
        }

        client.data.user = response;
        return true;
    }
}
