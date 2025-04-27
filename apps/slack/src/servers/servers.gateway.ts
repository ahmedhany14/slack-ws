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
import { Account, Namespaces } from '@app/database';

// interfaces and dtos
import { IWsAuthenticateRequest } from '@app/auth.common';
import { SocketI } from '../interfaces/socket.client.interface';

// services
import { ServerGatewayService } from './services/server.gateway.service';
import { NamespacesService } from '../namespaces/namespaces.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';
import { ServerChatsGatewayService } from '../server-chats/services/server.chats.gateway.service';
// decorators
import { WsExtractUserData } from '@app/decorators';

// filters
import { WsExceptionsFilter } from '@app/interceptors';

// dtos
import { CreateServerDto } from './dtos/create.server.dto';
import { UpdateServerDto } from './dtos/update.server.dto';
import { SendServerInvitationDto } from './dtos/send.server.invitation.dto';
import { ServerMembersListDto } from './dtos/server.members.list.dto';
import { KickUserDto } from './dtos/kick.user.dto';
import { UserRoleChangeDto } from './dtos/user.role.change.dto';

// guards
import { WsAuthGuard } from '../guards/ws.auth.guard';
import { WsIsServerOwner } from './guards/ws.is.server.owner.guard';
import { IsAllowedToInviteGuard } from './guards/is.allowed.to.invite.guard';
import { WsIsServerMemberGuard } from './guards/ws.is.server.member.guard';
import { WsIsServerAdminGuard } from './guards/ws.is.server.admin.guard';

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
        @Inject() private readonly gatewayService: ServerGatewayService,
        @Inject() private readonly serverChatsGatewayService: ServerChatsGatewayService,
        @Inject() private readonly NamespacesService: NamespacesService,
        @Inject() private readonly wsAuthenticateUserService: WsAuthenticateUserService,
    ) {}

    async handleConnection(client: SocketI) {
        try {
            // user authentication
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);

            client.join(`user:servers:${client.data.user.id}`);
            client.join(`user:servers:invitations:${client.data.user.id}`);

            await this.handleServerJoin(client);
        } catch (e) {
            this.logger.error('Error handling connection');
            client.emit('ws_error', {
                message: 'Unexpected error occurred',
            });
            client.disconnect();
        } finally {
            this.logger.log(`Client connected to servers namespace: ${client.id}`);
        }
    }

    private async handleServerJoin(client: SocketI) {
        this.logger.log(`Emitted servers to ${client.data.user?.id}`);
        const servers_data = await this.gatewayService.findMyServers(client);
        this.server.to(`user:servers:${client.data.user?.id}`).emit('servers:list', {
            message: 'user servers list',
            servers: servers_data,
        });
        return servers_data;
    }

    handleDisconnect(client: SocketI) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('create:new:server')
    async handleCreateServer(
        @WsExtractUserData() user: Account,
        @MessageBody() createServerDto: CreateServerDto,
    ) {
        this.logger.log(`user ${user.id} created new server`);
        const { server, owner } = await this.gatewayService.createServer(user, createServerDto);

        const general_namespace = await this.NamespacesService.create({
            name: 'general',
            server: { id: server.id },
        } as Namespaces);

        const general_chat = await this.serverChatsGatewayService.createServerChat(
            general_namespace.id
        )

        this.server.to(`user:servers:${user.id}`).emit('server:created', {
            message: 'server created',
            server,
            owner,
            general_namespace,
            general_chat,
        });
    }

    @UseGuards(WsAuthGuard)
    @SubscribeMessage('server:list')
    async handleServerList(@ConnectedSocket() client: SocketI) {
        this.logger.log(`user ${client.data.user?.id} requested server list`);
        const servers_data = await this.handleServerJoin(client);
        this.server.to(`user:servers:${client.data.user?.id}`).emit('servers:list', {
            message: 'user servers list',
            servers: servers_data,
        });
    }

    @UseGuards(WsAuthGuard, WsIsServerMemberGuard)
    @SubscribeMessage('server:members:list')
    async handleServerMembersList(
        @ConnectedSocket() client: SocketI,
        @MessageBody() serverMembersListDto: ServerMembersListDto,
    ) {
        this.logger.log(
            `user ${client.data.user?.id} requested server members list for server ${serverMembersListDto.server_id}`,
        );

        const members = await this.gatewayService.findServerMembers(serverMembersListDto.server_id);

        this.server.to(`user:servers:${client.data.user?.id}`).emit('server:members:list', {
            message: 'server members list',
            server_id: serverMembersListDto.server_id,
            server_name: members[0].server.name,
            members: members.map((member) => {
                return {
                    id: member.subscriber.id,
                    name: member.subscriber.username,
                    role: member.role,
                    joined_at: member.created_at,
                };
            }),
        });
    }

    @UseGuards(WsAuthGuard, WsIsServerOwner)
    @SubscribeMessage('server:update')
    async handleUpdateServer(
        @WsExtractUserData() user: Account,
        @MessageBody() updateServerDto: UpdateServerDto,
    ) {
        this.logger.log(`user ${user.id} updated server with id ${updateServerDto.server_id}`);
        const server = await this.gatewayService.updateServer(updateServerDto);
        this.server.to(`user:servers:${user.id}`).emit('server:updated', {
            message: 'server updated',
            server,
        });

        // TODO: emit on the general that server data updated and by how ...
    }

    @UseGuards(WsAuthGuard, IsAllowedToInviteGuard)
    @SubscribeMessage('server:users:invite')
    async handleServerUsersInvite(
        @WsExtractUserData() sender: Account,
        @MessageBody() sendServerInvitationDto: SendServerInvitationDto,
    ) {
        this.logger.log(
            `user ${sender.id} invited user ${sendServerInvitationDto.receiver_id} to server ${sendServerInvitationDto.server_id}`,
        );

        const invitation = await this.gatewayService.sendInvitationToUser(
            sender,
            sendServerInvitationDto,
        );

        // TODO: change to event emitter in the future
        this.server
            .to(`user:servers:invitations:${sendServerInvitationDto.receiver_id}`)
            .emit('server:users:invited', {
                message: `user ${sender.username} invited you to join server ${invitation.server?.name}`,
                invitation,
            });

        // TODO: emit on the server general that user invited to the server
    }

    @UseGuards(WsAuthGuard, WsIsServerAdminGuard)
    @SubscribeMessage('server:users:kick')
    async handelServerUsersKick(
        @ConnectedSocket() client: SocketI,
        @MessageBody() kickUserDto: KickUserDto,
    ): Promise<void> {
        const admin = client.data.user;
        this.logger.log(`user ${admin?.id} kicked user ${admin?.id} from server ${admin?.id}`);

        if (admin?.id === kickUserDto.user_id) throw new WsException("you can't kick yourself");

        await this.gatewayService.kickUser(admin, kickUserDto);

        // TODO: emit to the user that he removed from server
        // TODO: emit in the server general that user kicked
    }

    @UseGuards(WsAuthGuard, WsIsServerMemberGuard)
    @SubscribeMessage('server:users:leave')
    async handleServerUsersLeave(
        @ConnectedSocket() client: SocketI,
        @MessageBody() userLeaverServerDto: KickUserDto,
    ): Promise<void> {
        this.logger.log(
            `user ${client.data.user?.id} left server ${userLeaverServerDto.server_id}`,
        );

        await this.gatewayService.leaveServer(client.data.user, userLeaverServerDto);

        this.server.to(`user:servers:${client.data.user?.id}`).emit('server:users:left', {
            message: `user ${client.data.user?.username} left server ${userLeaverServerDto.server_id}`,
            server_id: userLeaverServerDto.server_id,
        });

        // TODO: emit in the server general that user left
    }

    @UseGuards(WsAuthGuard, WsIsServerOwner)
    @SubscribeMessage('server:users:role:change')
    async handleServerUsersRoleChange(
        @ConnectedSocket() client: SocketI,
        @MessageBody() userRoleChangeDto: UserRoleChangeDto,
    ): Promise<void> {
        const owner = client.data.user;
        this.logger.log(
            `user ${client.data.user?.id} changed user ${userRoleChangeDto.user_id} role in server ${userRoleChangeDto.server_id}`,
        );

        if (owner?.id === userRoleChangeDto.user_id)
            throw new WsException("you can't change your own role");

        await this.gatewayService.changeUserRole(userRoleChangeDto);

        this.server.to(`user:servers:${client.data.user?.id}`).emit('server:users:role:changed', {
            message: `user ${client.data.user?.username} changed user ${userRoleChangeDto.user_id} role in server ${userRoleChangeDto.server_id}`,
            server_id: userRoleChangeDto.server_id,
            user_id: userRoleChangeDto.user_id,
            role: userRoleChangeDto.role,
        });

        // TODO: emit in the server general that user role changed
        // TODO: emit to the user that his role changed
    }
}
