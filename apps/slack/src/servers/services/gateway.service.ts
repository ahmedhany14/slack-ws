import { Inject, Injectable } from '@nestjs/common';
import { ServerService } from './server.service';
import { SubscribersService } from './subscribers.service';
import { SocketI } from '../../interfaces/socket.client.interface';
import { ServerI, ServerInvitation } from '../interfaces/server.gatewat.interfaces';
import { Account, Server as _Server, subscriberRole, Subscribers } from '@app/database';
import { CreateServerDto } from '../dtos/create.server.dto';
import { UpdateServerDto } from '../dtos/update.server.dto';
import { SendServerInvitationDto } from '../dtos/send.server.invitation.dto';
import { WsException } from '@nestjs/websockets';
import { KickUserDto } from '../dtos/kick.user.dto';
import { UserRoleChangeDto } from '../dtos/user.role.change.dto';

@Injectable()
export class GatewayService {
    constructor(
        @Inject() private readonly serverService: ServerService,
        @Inject() private readonly subscribersService: SubscribersService,
    ) {}

    async createServer(user: Account, createServerDto: CreateServerDto) {
        const server = await this.serverService.create({
            ...createServerDto,
            owner: { id: user.id },
        } as _Server);
        const owner = await this.subscribersService.create({
            server: { id: server.id },
            subscriber: { id: user.id },
            role: subscriberRole.OWNER,
        } as Subscribers);

        return {
            server,
            owner,
        };
    }

    async findMyServers(client: SocketI) {
        const my_servers = await this.subscribersService.find({
            subscriber: { id: client.data.user?.id },
        });
        return my_servers.map((server) => ({
            id: server.server.id,
            name: server.server.name,
            description: server.server.description,
            owner: server.server.owner,
            visible: server.server.visable,
        })) as ServerI[];
    }

    async findServerMembers(server_id: number) {
        const members = await this.subscribersService.find({
            server: { id: server_id },
        });

        return members.filter((member) => {
            return [subscriberRole.ADMIN, subscriberRole.MEMBER, subscriberRole.OWNER].includes(
                member.role,
            );
        });
    }

    async updateServer(updateServerDto: UpdateServerDto) {
        const { server_id, ...updateData } = updateServerDto;
        return await this.serverService.findOneAndUpdate(
            { id: updateServerDto.server_id },
            updateData,
        );
    }

    async sendInvitationToUser(sender: Account, sendServerInvitationDto: SendServerInvitationDto) {
        const server = await this.serverService.findOne({ id: sendServerInvitationDto.server_id });

        await this.subscribersService.create({
            server: { id: sendServerInvitationDto.server_id },
            subscriber: { id: sendServerInvitationDto.receiver_id },
            role: subscriberRole.PENDING,
        } as Subscribers);

        return {
            server: {
                id: server?.id,
                name: server?.name,
                description: server?.description,
            },
            invited_by: {
                id: sender.id,
                name: sender.username,
            },
        } as ServerInvitation;
    }

    async kickUser(
        admin: { id: number; username: string; anyone_dm: boolean } | undefined,
        kickUserDto: KickUserDto,
    ) {
        const user_subscriber = await this.subscribersService.findOne({
            server: { id: kickUserDto.server_id },
            subscriber: { id: kickUserDto.user_id },
        });
        const admin_subscriber = await this.subscribersService.findOne({
            server: { id: kickUserDto.server_id },
            subscriber: { id: admin?.id },
        });

        if (!user_subscriber) throw new WsException('user is not a member of the server');
        if (user_subscriber.role === subscriberRole.OWNER)
            throw new WsException("you can't kick the server owner");
        if (
            user_subscriber.role == subscriberRole.ADMIN &&
            admin_subscriber?.role !== subscriberRole.OWNER
        )
            throw new WsException("you can't kick the server admin, you are not the server owner");

        await this.subscribersService.findOneAndUpdate(
            { server: { id: kickUserDto.server_id }, subscriber: { id: kickUserDto.user_id } },
            { role: subscriberRole.REMOVED } as Subscribers,
        );
    }

    async leaveServer(
        user: { id: number; username: string; anyone_dm: boolean } | undefined,
        userLeaverServerDto: KickUserDto,
    ) {
        const user_subscriber = await this.subscribersService.findOne({
            server: { id: userLeaverServerDto.server_id },
            subscriber: { id: user?.id },
        });
        if (user_subscriber?.role === subscriberRole.OWNER)
            throw new WsException("you are the server owner, you can't leave the server");

        await this.subscribersService.findOneAndUpdate(
            { server: { id: userLeaverServerDto.server_id }, subscriber: { id: user?.id } },
            { role: subscriberRole.LEAVE } as Subscribers,
        );
    }

    async changeUserRole(userRoleChangeDto: UserRoleChangeDto) {
        await this.subscribersService.findOneAndUpdate(
            {
                server: { id: userRoleChangeDto.server_id },
                subscriber: { id: userRoleChangeDto.user_id },
            },
            {
                role: userRoleChangeDto.role as string,
            } as Subscribers,
        );
    }
}
