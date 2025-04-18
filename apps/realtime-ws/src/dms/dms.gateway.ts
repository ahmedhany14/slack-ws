import { Inject, Logger, UseFilters } from '@nestjs/common';

import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DmsService } from './dms.service';
import { WsExceptionsFilter } from '@app/interceptors';
import { IWsAuthenticateRequest } from '@app/auth.common';
import { SocketI } from '../interfaces/socket.client.interface';

@UseFilters(new WsExceptionsFilter())
@WebSocketGateway(3001, {
    namespace: '/dms',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 20000,
    pingInterval: 25000,
})
export class DmsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private readonly logger = new Logger(DmsGateway.name);

    constructor(@Inject() private readonly dmsService: DmsService) { }

    async handleConnection(client: SocketI) {
        /*
            Here you need to implement the following functionality:
            1) you need to check if the user is authenticated  (DONE)
            2) you need to send a list of the direct messages to the user (list of conversations) // the core functionality of the DMS
            3) join the user to the room with the same name as the user id, so that the user can receive messages from other users  (DONE)

            2) if the user is authenticated, you need to add the user to the list of connected users // will be implemented in the future
            3) if the user is not authenticated, you need to disconnect the user // will be implemented in the future

            */
        try {
            // 1) you need to check if the user is authenticated
            const request: IWsAuthenticateRequest = {
                token: this.dmsService.extractToken(client),
            };
            const response = await this.dmsService.authenticate(request);

            this.logger.log('authenticate user to connect to dms', response);
            client.data.user = response;                
            client.join(`user:direct-messages:${request.user?.id}`);
        } catch (error) {
            this.logger.log('Connection error');

            // Emit specific error to client
            client.emit('error', {
                message: error instanceof WsException
                    ? error.getError().toString()
                    : 'Authentication failed'
            });

            // Disconnect client
            client.disconnect();
        } finally {
            this.logger.log(`Client connected: ${client.id}`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('send:direct-message')
    async sendMessage(@MessageBody() body: { sender: string; recipient: string }) {
        /*
         Here you need to implement the following functionality:
         1) you need to check if the user is authenticated
         2) if the user is authenticated, you need to send the message to the recipient
         3) if the user is not authenticated, you need to throw an exception
         */

        this.logger.log(`Message sent from ${body.sender} to ${body.recipient}`);
    }
}
