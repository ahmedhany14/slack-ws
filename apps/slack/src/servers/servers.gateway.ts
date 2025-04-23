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
import { Account, Server as _Server, Subscribers, subscriberRole } from '@app/database';

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

// decorators
import { CreateServerDto } from './dtos/create.server.dto';
import { UpdateServerDto } from './dtos/update.server.dto';
import { SendServerInvitationDto } from './dtos/send.server.invitation.dto';

// guards
import { WsAuthGuard } from '../guards/ws.auth.guard';
import { WsIsServerOwner } from './guards/ws.is.server.owner.guard';
import { IsAllowedToInviteGuard } from './guards/is.allowed.to.invite.guard';


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
            client.join(`user:servers:invitations:${client.data.user.id}`);

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


    /**
     * Handles the request for the server list.
     * 
     * This method is triggered when a client emits the 'server:list' event.
     * 
     * @param client socket client who requested the server list
     * @returns the list of servers the user is subscribed to 
     */
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('server:list')
    async handleServerList(
        @ConnectedSocket() client: SocketI,
    ) {
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

        this.server
            .to(`user:servers:${client.data.user?.id}`)
            .emit('servers:list', {
                message: "user servers list",
                servers: servers_data
            });
    }

    // TODO: add server members list event

    /**
     * Handles the creation of a new server.
     * 
     * This method is triggered when a client emits the 'create:new:server' event.
     * 
     * @param user user data extracted from the socket connection
     * @param createServerDto server data to be created
     * @returns server data, created by the user
     */
    @UseGuards(WsAuthGuard)
    @SubscribeMessage('create:new:server')
    async handleCreateServer(
        @WsExtractUserData() user: Account,
        @MessageBody() createServerDto: CreateServerDto
    ) {
        this.logger.log(`user ${user.id} created new server`);
        const server = await this.serverService.create({
            ...createServerDto,
            owner: { id: user.id },
        } as _Server);
        const owner_subscriber = await this.subscribersService.create({
            server: { id: server.id },
            subscriber: { id: user.id },
            role: subscriberRole.OWNER,
        } as Subscribers);
        this.logger.log(`user ${user.id} created new server with id ${server.id}`);

        this.server
            .to(`user:servers:${user.id}`).emit('server:created', {
                message: 'server created',
                server,
                owner: owner_subscriber
            });
    }


    /**
     * Handles the update of an existing server.
     * 
     * This method is triggered when a client emits the 'server:update' event.
     * 
     * @param user user data extracted from the socket connection
     * @param updateServerDto server data to be updated
     * @returns updated server data
     */
    @UseGuards(WsAuthGuard, WsIsServerOwner)
    @SubscribeMessage('server:update')
    async handleUpdateServer(
        @WsExtractUserData() user: Account,
        @MessageBody() updateServerDto: UpdateServerDto
    ) {
        this.logger.log(`user ${user.id} updated server with id ${updateServerDto.server_id}`);
        const { server_id, ...updateData } = updateServerDto;
        const server = await this.serverService.findOneAndUpdate(
            { id: updateServerDto.server_id },
            updateData
        );
        this.server
            .to(`user:servers:${user.id}`).emit('server:updated', {
                message: 'server updated',
                server
            });

        // TODO: emit on the general that server data updated and by how ...
    }


    // TODO: add server users invite event
    /*
        require authenticated user
        require valid server id
        require valid user id
    */
    @UseGuards(WsAuthGuard, IsAllowedToInviteGuard)
    @SubscribeMessage('server:users:invite')
    async handleServerUsersInvite(

        @WsExtractUserData() user: Account,
        @MessageBody() sendServerInvitationDto: SendServerInvitationDto
    ) {
        this.logger.log(`user ${user.id} invited user ${sendServerInvitationDto.receiver_id} to server ${sendServerInvitationDto.server_id}`);

        const server = await this.serverService.findOne({ id: sendServerInvitationDto.server_id });

        const invitation = await this.subscribersService.create({
            server: { id: sendServerInvitationDto.server_id },
            subscriber: { id: sendServerInvitationDto.receiver_id },
            role: subscriberRole.PENDING,
        } as Subscribers);

        // TODO: change to event emitter in the future 
        this.server
            .to(`user:servers:invitations:${sendServerInvitationDto.receiver_id}`).
            emit('server:users:invited', {
                message: `user ${user.username} invited you to join server ${server?.name}`,
                invitation: {
                    server: {
                        id: server?.id,
                        name: server?.name,
                        description: server?.description,
                    },
                    invited_by: {
                        id: user.id,
                        name: user.username,
                    },
                }
            });

        // TODO: emit on the server general that user invited to the server
    }

    // TODO: add server users accept or reject event


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
