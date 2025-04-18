import { Inject, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';

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
import { RealtimeWsAuthService } from '../realtime-ws.auth.service';
import { WsAuthGuard } from '../guards/ws.auth.guard';
import { SendDmMessageDto } from './dtos/send.dm.message.dto';
import { validate } from 'class-validator';
import { DirectConversation } from '@app/database';

@UseFilters(new WsExceptionsFilter())
@UsePipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
        const messages = errors.map(error =>
            `${error.property}: ${Object.values(error.value).join(', ')}`
        );
        throw new WsException(messages);
    }
}))
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

    constructor(
        @Inject() private readonly dmsService: DmsService,
        @Inject() private readonly realtimeWsAuthService: RealtimeWsAuthService
    ) { }

    async handleConnection(client: SocketI) {
        /*
            Here you need to implement the following functionality:
            1) you need to check if the user is authenticated (DONE)
            2) you need to send a list of the direct messages to the user (list of conversations) // the core functionality of the DMS :
            3) join the user to the room with the same name as the user id, so that the user can receive messages from other users (DONE)

            2) if the user is authenticated, you need to add the user to the list of connected users // will be implemented in the future TODO:
            3) if the user is not authenticated, you need to disconnect the user // will be implemented in the future TODO: 

            */
        try {
            // 1) you need to check if the user is authenticated
            const request: IWsAuthenticateRequest = {
                token: this.realtimeWsAuthService.extractToken(client),
            };
            const response = await this.realtimeWsAuthService.authenticate(request);

            this.logger.log('authenticate user to connect to dms', response);
            client.data.user = response;

            this.logger.log('user:direct-messages:', `user:direct-messages:${client.data.user.id}`);
            client.join(`user:direct-messages:${client.data.user.id}`);
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

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('send:direct-message')
    async sendMessage(@MessageBody() sendDmMessageDto: SendDmMessageDto) {

        /*
            Here you need to implement the following functionality:
            1) you need to check if the user is authenticated 
            2) if the user is authenticated, you need to send the message to the recipient
            3) conversation corrner cases:
                1) if the conversation already exists, you need to send the message to the existing conversation
                2) if the conversation does not exist, you need to create a new conversation and send the message to the new conversation
         */


        let directConversation = await this.dmsService.findOrCreateDm(
            sendDmMessageDto
        )
        // TODO: add message to messages db
        /*
            Will be implemented later
        */
        this.logger.log(`Message sent from ${sendDmMessageDto.conversation_initiator} to ${sendDmMessageDto.conversation_recipient}`);

        this.server.to(`user:direct-messages:${sendDmMessageDto.conversation_recipient}`).emit('receive:direct-message', {
            message: sendDmMessageDto.content,
            conversation_id: directConversation?.id,
            conversation_initiator: sendDmMessageDto.conversation_initiator,
            conversation_recipient: sendDmMessageDto.conversation_recipient,
        });

    }
}
