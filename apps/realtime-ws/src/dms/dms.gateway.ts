import { Inject, Logger, UseFilters, UseGuards } from '@nestjs/common';

import {
    WebSocketGateway,
    SubscribeMessage,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

    async handleConnection(client: Socket) {
        /*
         Here you need to implement the following functionality:
         1) you need to check if the user is authenticated
         2) if the user is authenticated, you need to add the user to the list of connected users // will be implemented in the future
         3) if the user is not authenticated, you need to disconnect the user // will be implemented in the future
         4) you need to send a list of the direct messages to the user (list of conversations) // the core functionality of the DMS
         5) join the user to the room with the same name as the user id, so that the user can receive messages from other users
         */
        const user_id = 10;
        client.join(`user:direct-messages:${user_id}`);
        this.logger.log(`Client connected: ${client.id}`);
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
