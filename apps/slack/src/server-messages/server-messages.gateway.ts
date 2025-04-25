import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Inject, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server } from 'socket.io';
import { SocketI } from '../interfaces/socket.client.interface';

// services
import { ServerGatewayService } from '../servers/services/server.gateway.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';
import { IWsAuthenticateRequest } from '@app/auth.common';

@WebSocketGateway()
export class ServerMessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private readonly logger = new Logger(ServerMessagesGateway.name);

    constructor(
        @Inject()
        private readonly serverGatewayService: ServerGatewayService,
        @Inject()
        private readonly wsAuthenticateUserService: WsAuthenticateUserService,
    ) {}

    async handleConnection(@ConnectedSocket() client: SocketI) {
        try {
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);
            client.join(`user:server-messages:${client.data.user.id}`);

            // TODO: Load user server chats metadata
        } catch (error) {
        } finally {
            this.logger.log(`Client connected to server messages namespace: ${client.id}`);
        }
    }

    async handleDisconnect(@ConnectedSocket() client: SocketI) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // TODO: Create a server chat

    // TODO: Update server chat privacy

    // TODO: Delete server chat

    // TODO: if chat private, add user to server chat

    // TODO: Send message to server chat

    // TODO: Delete message from server chat

    // TODO: Edit message from server chat
}
