import {
    ConflictException,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@app/auth.common';
import { ExtractUserData } from '@app/decorators';
import { IsExistUserGuard } from '@app/auth.common/guards/is.exist.user.guard';
import { FriendsInvitations, RequestStatus } from '@app/database';

@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
    constructor(
        @Inject()
        private readonly friendsService: FriendsService,
    ) {}

    /**
     * Function to get all friends of a user
     * @param user_id
     * @returns List of friends
     */
    @Get('all-friends')
    async getAllFriends(@ExtractUserData('id') user_id: number) {
        console.log('getAllFriends');

        const friends_i_send_to_them = await this.friendsService.find({
            sender: { id: user_id },
            request_status: RequestStatus.ACCEPTED,
        });

        const friends_i_receive_from_them = await this.friendsService.find({
            receiver: { id: user_id },
            request_status: RequestStatus.ACCEPTED,
        });
        return [...friends_i_send_to_them, ...friends_i_receive_from_them];
    }

    /**
     * Function to get all friend requests sent to a user
     * @param user_id
     * @return List of friend requests
     */
    @Get('pending-friend-requests')
    async getPendingFriendRequests(@ExtractUserData('id') user_id: number) {
        console.log('getPendingFriendRequests of user_id = ', user_id);

        return this.friendsService.find({
            sender: { id: user_id },
            request_status: RequestStatus.PENDING,
        });
    }

    /**
     * Function to send a friend request
     * @param sender_id
     * @param receiver_id
     * @returns Response with the created friend request
     * @throws ConflictException if the sender_id and receiver_id are the same
     * @throws NotFoundException if the receiver_id does not exist
     * @throws InternalServerErrorException if there is an error while creating the friend request
     */
    @UseGuards(IsExistUserGuard)
    @Post('send-friend-request/:receiver_id')
    async addFriend(
        @ExtractUserData('id') sender_id: number,
        @Param('receiver_id', ParseIntPipe) receiver_id: number,
    ) {
        console.log('addFriend where sender_id = ', sender_id, ' and receiver_id = ', receiver_id);

        if (sender_id === receiver_id) {
            throw new ConflictException('You cannot send a friend request to yourself');
        }

        const is_friend = await this.friendsService.findOne({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.ACCEPTED,
        } as FriendsInvitations);

        if (is_friend) throw new ConflictException('You are already friends');

        const is_pending = await this.friendsService.findOne({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.PENDING,
        } as FriendsInvitations);
        if (is_pending) throw new ConflictException('You already sent a friend request');

        return this.friendsService.create({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
        } as FriendsInvitations);
    }

    /**
     * Function to accept a friend request
     * @param receiver_id
     * @param sender_id
     * @returns Response with the updated friend request, state => accepted
     * @throws ConflictException if the friend request is not found
     */
    @Patch('accept-friend-request/:sender_id')
    async acceptFriendRequest(
        @ExtractUserData('id') receiver_id: number,
        @Param('sender_id', ParseIntPipe) sender_id: number,
    ) {
        console.log(
            'acceptFriendRequest where sender_id = ',
            sender_id,
            ' and receiver_id = ',
            receiver_id,
        );

        await this.friendsService.findOneAndUpdate(
            {
                sender: { id: sender_id },
                receiver: { id: receiver_id },
                request_status: RequestStatus.PENDING,
            },
            {
                request_status: RequestStatus.ACCEPTED,
            },
        );

        return {
            message: 'Friend request accepted',
        };
    }

    /**
     * Function to reject a friend request
     * @param receiver_id
     * @param sender_id
     * @returns Response with the updated friend request, state => rejected
     * @throws ConflictException if the friend request is not found
     */

    @Delete('reject-friend-request/:sender_id')
    async rejectFriendRequest(
        @ExtractUserData('id') receiver_id: number,
        @Param('sender_id', ParseIntPipe) sender_id: number,
    ) {
        console.log(
            'rejectFriendRequest where sender_id = ',
            sender_id,
            ' and receiver_id = ',
            receiver_id,
        );

        await this.friendsService.findOneAndUpdate(
            {
                receiver: { id: receiver_id },
                sender: { id: sender_id },
                request_status: RequestStatus.PENDING,
            },
            {
                request_status: RequestStatus.REJECTED,
            },
        );

        return {
            message: 'Friend request rejected',
        };
    }

    @Delete('cancel-friend-request/:receiver_id')
    async cancelFriendRequest(
        @ExtractUserData('id') sender_id: number,
        @Param('receiver_id', ParseIntPipe) receiver_id: number,
    ) {
        console.log(
            'cancelFriendRequest where sender_id = ',
            sender_id,
            ' and receiver_id = ',
            receiver_id,
        );

        await this.friendsService.findOneAndDelete({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.PENDING,
        });

        return {
            message: 'Friend request canceled',
        };
    }

    @Delete('remove-friend/:friend_id')
    async removeFriend(
        @ExtractUserData('id') user_id: number,
        @Param('friend_id', ParseIntPipe) friend_id: number,
    ) {
        console.log('removeFriend where user_id = ', user_id, ' and friend_id = ', friend_id);

        await this.friendsService.findOneAndDelete({
            sender: { id: user_id },
            receiver: { id: friend_id },
            request_status: RequestStatus.ACCEPTED,
        });

        return {
            message: 'Friend removed',
        };
    }
}
