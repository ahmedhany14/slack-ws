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
import { Inject, Logger, UseFilters, UseGuards, UsePipes, ValidationPipe, Get } from '@nestjs/common';
import { Server } from 'socket.io';

// database
import { Namespaces } from '@app/database';


// decorators
import { WsExtractUserData } from '@app/decorators';

// services
import { NamespacesService } from './namespaces.service';
import { WsAuthenticateUserService } from '../common/ws.authenticate.user.service';

// filters
import { WsExceptionsFilter } from '@app/interceptors';

// dtos
import { GetServerNameSpacesDto } from './dtos/get.server.name.spaces.dto';
import { CreateNamespaceDto } from './dtos/create.namespace.dto';



// guards
import { WsAuthGuard } from '../guards/ws.auth.guard';
import { WsIsServerOwner } from '../common/guards/ws.is.server.owner.guard';
import { IsAllowedToInviteGuard } from '../servers/guards/is.allowed.to.invite.guard';
import { WsIsServerMemberGuard } from '../common/guards/ws.is.server.member.guard';
import { WsIsServerAdminGuard } from '../common/guards/ws.is.server.admin.guard';
import { SocketI } from '@app/interfaces/socket.client.interface';
import { IWsAuthenticateRequest } from '@app/auth.common';
import { DeleteNamespaceDto } from './dtos/delete.namespaces.dto';
import { UpdateNamespaceDto } from './dtos/update.namespace.dto';



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
@WebSocketGateway(3005, {
    namespace: 'namespaces',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class NamespacesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger: Logger = new Logger(NamespacesGateway.name);

    constructor(
        @Inject() private readonly namespacesService: NamespacesService,
        @Inject() private readonly wsAuthenticateUserService: WsAuthenticateUserService,
    ) { }

    async handleConnection(@ConnectedSocket() client: SocketI): Promise<void> {
        try {
            const request: IWsAuthenticateRequest = {
                token: this.wsAuthenticateUserService.extractToken(client),
            };
            client.data.user = await this.wsAuthenticateUserService.authenticate(request);
            client.join(`user"servers:namespace:${client.data.user.id}`);

        } catch (error) {
            this.logger.error('Error handling connection');
            client.emit('ws_error', {
                message: 'Unexpected error occurred',
            });
            client.disconnect();
        }
        finally {
            this.logger.log('Client connected to namespaces gateway');
        }
    }

    async handleDisconnect(@ConnectedSocket() client: SocketI): Promise<void> {
        this.logger.log('Client disconnected from namespaces gateway');
    }

    @UseGuards(WsAuthGuard, WsIsServerMemberGuard)
    @SubscribeMessage('get:server:namespaces')
    async handelGetServerNamespaces(
        @ConnectedSocket() client: SocketI,
        @MessageBody() getServerNameSpacesDto: GetServerNameSpacesDto,
    ) {
        this.logger.log('Getting server namespaces');

        const { server_id } = getServerNameSpacesDto;

        const namespaces = await this.namespacesService.find({
            server: { id: server_id },
        })

        await Promise.all(namespaces.map(async (namespace) => {
            await namespace.chats;
        }));

        const formattedNamespaces = await Promise.all(namespaces.map(async (namespace) => ({
            id: namespace.id,
            name: namespace.name,
            server_id: namespace.server.id,
            created_at: namespace.created_at,
            updated_at: namespace.updated_at,
            chats: (await namespace.chats).map((chat) => ({
                id: chat.id,
                name: chat.name,
                created_at: chat.created_at,
                updated_at: chat.updated_at,
                type: chat.chat_type,
            })),
        })));


        this.server.to(`user"servers:namespace:${client.data.user?.id}`)
            .emit('get:server:namespaces', {
                namespaces: formattedNamespaces
            })
    }


    @UseGuards(WsAuthGuard, WsIsServerAdminGuard)
    @SubscribeMessage('create:server:namespace')
    async handelCreateNamespace(
        @ConnectedSocket() client: SocketI,
        @MessageBody() createNamespaceDto: CreateNamespaceDto,
    ) {
        this.logger.log('Creating a new namespace');

        const { server_id } = createNamespaceDto;

        const namespace = await this.namespacesService.create({
            name: createNamespaceDto.name,
            server: { id: server_id },
        } as Namespaces);

        this.server.to(`user"servers:namespace:${client.data.user?.id}`)
            .emit('created:namespace', {
                namespace: {
                    id: namespace.id,
                    name: namespace.name,
                    server_id: namespace.server.id,
                    created_at: namespace.created_at,
                    updated_at: namespace.updated_at,
                }
            })
    }

    @UseGuards(WsAuthGuard, WsIsServerAdminGuard)
    @SubscribeMessage('delete:server:namespace')
    async handelDeleteNamespace(
        @ConnectedSocket() client: SocketI,
        @MessageBody() deleteNamespaceDto: DeleteNamespaceDto,
    ) {
        this.logger.log('Deleting a namespace');

        const { server_id, namespaces_id } = deleteNamespaceDto;

        await this.namespacesService.findOneAndDelete({
            id: namespaces_id,
            server: { id: server_id },
        });

        this.server.to(`user"servers:namespace:${client.data.user?.id}`)
            .emit('deleted:namespace', {
                message: 'Namespace deleted successfully',
                namespace: {
                    id: namespaces_id,
                    server_id: server_id,
                }
            })
    }

    @UseGuards(WsAuthGuard, WsIsServerAdminGuard)
    @SubscribeMessage('update:server:namespace')
    async handelUpdateNamespace(
        @ConnectedSocket() client: SocketI,
        @MessageBody() updateNamespaceDto: UpdateNamespaceDto,
    ) {
        this.logger.log('Updating a namespace');

        const { server_id } = updateNamespaceDto;

        const namespace = await this.namespacesService.findOneAndUpdate({
            id: updateNamespaceDto.namespaces_id,
        }, {
            name: updateNamespaceDto.name,
        }) as Namespaces;

        this.server.to(`user"servers:namespace:${client.data.user?.id}`)
            .emit('updated:namespace', {
                message: 'Namespace updated successfully',
                namespace: {
                    id: namespace.id,
                    name: namespace.name,
                    server_id: namespace.server.id,
                    created_at: namespace.created_at,
                    updated_at: namespace.updated_at,
                }
            })
    }

}
