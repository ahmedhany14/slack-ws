import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { DataSource } from 'typeorm';
import { Account, RequestStatus } from '@app/database';


import { FriendsService } from '../../friends/friends.service';
import { SendDmMessageDto } from '../dtos/send.dm.message.dto';
import { SocketI } from '@app/interfaces/socket.client.interface';


@Injectable()
export class AllowToMessageHimGuard implements CanActivate {

    private readonly logger: Logger = new Logger(AllowToMessageHimGuard.name);

    constructor(
        @Inject()
        private readonly friendsService: FriendsService,
        private readonly dataSource: DataSource
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const client: SocketI = context.switchToWs().getClient();

        this.logger.log('Checking if user is allowed to message him');
        const accountRepository = this.dataSource.getRepository(Account);
        const body: SendDmMessageDto = context.switchToWs().getData();

        const { user } = client.data;

        const receiver = await accountRepository.findOne({
            where: { id: body.conversation_recipient },
        });

        this.logger.log(JSON.stringify(receiver));

        if (receiver?.anyone_dm) {
            return true;
        }

        const friend_relationship = await this.friendsService.findOne(
            {
                receiver: { id: user?.id },
                sender: { id: body.conversation_recipient },
                request_status: RequestStatus.ACCEPTED
            }
        ) || await this.friendsService.findOne(
            {
                receiver: { id: body.conversation_recipient },
                sender: { id: user?.id },
                request_status: RequestStatus.ACCEPTED
            }
        );

        if (!friend_relationship) {
            this.logger.log('User is not friends with this user');

            throw new WsException('You are not friends with this user');
        }

        return true;
    }
} 
