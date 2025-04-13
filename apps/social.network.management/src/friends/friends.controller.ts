import { ConflictException, Controller, Inject, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@app/auth.common';
import { ExtractUserData } from '@app/decorators';
import { IsExistUserGuard } from '@app/auth.common/guards/is.exist.user.guard';
import { FriendsInvitations } from '@app/database';


@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {

    constructor(
        @Inject()
        private readonly friendsService: FriendsService
    ) { }

    @UseGuards(IsExistUserGuard)
    @Post('add/:receiver_id')
    async addFriend(
        @ExtractUserData('id') sender_id: number,
        @Param('receiver_id', ParseIntPipe) receiver_id: number
    ) {
        console.log('addFriend', sender_id, receiver_id);

        if (sender_id === receiver_id) {
            throw new ConflictException('You cannot send a friend request to yourself');
        }


        return this.friendsService.create({
            sender: { id: sender_id },
            receiver: { id: receiver_id }
        } as FriendsInvitations);
    }
}
