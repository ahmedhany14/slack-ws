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

// interfaces and dtos
import { IWsAuthenticateRequest } from '@app/auth.common';
import { SocketI } from '../interfaces/socket.client.interface';

// services
import { ServerService } from './services/server.service';
import { SubscribersService } from './services/subscribers.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';


// decorators
import { WsExtractUserData } from '@app/decorators';

// filters
import { WsExceptionsFilter } from '@app/interceptors';
import { Account, Namespaces } from '@app/database';


interface serversI {
    id: number;
    name: string;
    description: string;
    owner: Account;
    visible: boolean;
}

@UseFilters(new WsExceptionsFilter())
@UsePipes(
    new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
            const messages = errors.map(
                (error) => `${error.property}: ${Object.values(error.value).join(', ')}`,
            );
            throw new WsException(messages);
        },
    }),
)
@WebSocketGateway(3004, {
    namespace: '/servers',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class ServersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private readonly logger = new Logger(ServersGateway.name);


    constructor(
        @Inject() private readonly serverService: ServerService,
        @Inject() private readonly subscribersService: SubscribersService,
        @Inject() private readonly wsAuthenticateUserService: WsAuthenticateUserService,
    ) { }

    async handleConnection(client: SocketI) {
        try {
            // user authentication
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);

            // OK: joining user to listening events
            client.join(`user:servers:${client.data.user.id}`);

            // OK: emit server list to the client
            const servers: serversI[] = await this.handleServerJoin(client);

            // OK: emit servers members to the client
            await this.handelServerMembers(client, servers);

        } catch (e) {
            this.logger.error('Error handling connection');
            client.emit('ws_error', {
                message: 'Unexpected error occurred',
            });
            client.disconnect();
        }
        finally {
            this.logger.log(`Client connected to servers namespace: ${client.id}`);
        }
    }

    private async handleServerJoin(client: SocketI) {
        this.logger.log(`Emitted servers to ${client.data.user?.id}`);
        const my_servers = await this.subscribersService.find({
            subscriber: { id: client.data.user?.id },
        });
        const servers_data = my_servers.map((server) => ({
            id: server.server.id,
            name: server.server.name,
            description: server.server.description,
            owner: server.server.owner,
            visible: server.server.visable,
        }))
        this.server.to(`user:servers:${client.data.user?.id}`).emit('servers:list', {
            message: "user servers list",
            servers: servers_data
        });
        return servers_data as serversI[];
    }

    private async handelServerMembers(client: SocketI, servers: serversI[]) {
        this.logger.log(`Emitted servers members to ${client.data.user?.id}`);
        const server_members = new Map<number, {}>(), serverMembersObj = {};
        for (const server of servers) {
            const members = await this.subscribersService.find({
                server: { id: server.id },
                subscriber: { id: client.data.user?.id },
            });

            server_members.set(server.id, members.map((member) => {
                return {
                    id: member.subscriber.id,
                    name: member.subscriber.username,
                    role: member.role,
                    joined_at: member.created_at,
                }
            }));
        }

        for (const [serverId, members] of server_members.entries()) serverMembersObj[serverId] = members;

        this.server.to(`user:servers:${client.data.user?.id}`).emit('servers:members', {
            message: `server members`,
            server_members: serverMembersObj
        });
    }

    handleDisconnect(client: SocketI) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // TODO: add server create event
    /*
        Just require authenticated user
    */

    // TODO: add server users invite event
    /*
        require authenticated user
        require valid server id
        require valid user id
    */

    // TODO: add server users kick event
    /*
        require authenticated user
        require valid server id
        require valid user id
        require user is server owner
    */

    // TODO: add server users leave event
    /*
        require authenticated user
        require valid server id
        require user is server member
    */

    // TODO: add server users role change event
    /*
        require authenticated user
        require valid server id
        require valid user id
        require user is server owner or admin
        require user to be changed is server member
    */
}
