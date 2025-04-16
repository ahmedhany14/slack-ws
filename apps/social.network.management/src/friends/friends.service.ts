import { AbstractRepoService } from '@app/database';
import { FriendsInvitations } from '@app/database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FriendsService extends AbstractRepoService<FriendsInvitations> {

    protected readonly logger = new Logger(FriendsService.name);
    constructor(
        @InjectRepository(FriendsInvitations)
        private readonly friendsInvitationsRepository: Repository<FriendsInvitations>,
    ) {
        super(friendsInvitationsRepository);
    }
}
