import {
    ConflictException,
    Controller,
    Delete,
    Get,
    Inject,
    Logger,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@app/auth.common';
import { ExtractUserData } from '@app/decorators';
import { FriendsInvitations, RequestStatus } from '@app/database';
import { Body } from '@nestjs/common';
import { AcceptFriendRequestDto, CancelFriendRequestDto, RejectFriendRequestDto, RemoveFriendDto, SendFriendRequestDto } from './dtos/friend.reques.id.validators.dto';

@UseGuards(AuthGuard)
@Controller('friends')
export class FriendsController {
    private readonly logger: Logger = new Logger(FriendsController.name);

    constructor(
        @Inject()
        private readonly friendsService: FriendsService,
    ) { }

    /**
     * Retrieves all friends for the specified user.
     *
     * @param {number} user_id - The ID of the user whose friends are to be retrieved.
     * @return {Promise<{ response: { friends: { id: number; name: string; }[]; }; }>} - A promise that resolves to an object containing the list of friends.
     */
    @Get('all-friends')
    async getAllFriends(@ExtractUserData('id') user_id: number): Promise<{
        response: {
            friends: {
                id: number;
                name: string;
            }[];
        };
    }> {
        this.logger.log('getAllFriends of user_id = ', user_id);

        const friends = await this.friendsService.getMyFriends(user_id);

        return {
            response: {
                friends,
            },
        };
    }

    /**
     * Retrieves all pending friend invitations for a given user.
     *
     * @param {number} user_id - The ID of the user whose pending friend invitations are to be retrieved.
     * @return {Promise<Array<Object>>} A promise that resolves to a list of friend invitations. Each invitation includes:
     *  - id: The ID of the invitation.
     *  - sender: An object containing the sender's ID and username.
     *  - request_status: The status of the friend invitation request.
     */
    @Get('all-friends-invitations')
    async getAllFriendsInvitations(@ExtractUserData('id') user_id: number): Promise<{
        response: {
            invitations: {
                id: number;
                sender: {
                    id: number;
                    username: string;
                };
                request_status: RequestStatus;
            }[];
        };
    }> {
        this.logger.log('getAllFriendsInvitations of user_id = ', user_id);

        const friends_invitations = await this.friendsService.find({
            receiver: { id: user_id },
            request_status: RequestStatus.PENDING,
        } as FriendsInvitations);

        const invitations = friends_invitations.map((invitation) => ({
            id: invitation.id,
            sender: {
                id: invitation.sender.id,
                username: invitation.sender.username,
            },
            request_status: invitation.request_status,
        }));

        return {
            response: { invitations },
        };
    }

    /**
     * Fetches the list of pending friend requests for the given user.
     *
     * @param {number} user_id - The unique identifier of the user whose pending friend requests are being retrieved.
     * @return {Promise<{ response: { pendingRequests: FriendsInvitations[]; }; }>} - A promise that resolves to an object containing the list of pending friend requests.
     */
    @Get('pending-friend-requests')
    async getPendingFriendRequests(@ExtractUserData('id') user_id: number): Promise<{
        response: {
            pendingRequests: FriendsInvitations[];
        };
    }> {
        this.logger.log('getPendingFriendRequests of user_id = ', user_id);

        const pendingRequests = await this.friendsService.find({
            sender: { id: user_id },
            request_status: RequestStatus.PENDING,
        });

        return {
            response: {
                pendingRequests,
            },
        };
    }

    /**
     * Handles the logic for sending a friend request from one user to another.
     * Validates whether the friend request can be sent and creates a new record in the friends service if successful.
     * Throws exceptions if the request cannot be completed due to various conflicts.
     *
     * @param {number} sender_id - The ID of the user sending the friend request.
     * @param {number} receiver_id - The ID of the user receiving the friend request.
     * @param {SendFriendRequestDto} sendFriendRequesDto - The DTO containing the details of the friend request.
     * @return {Promise<FriendsInvitations>} A promise that resolves with the new friend request invitation object if successful.
     * @throws {ConflictException} If the sender attempts to send a request to themselves.
     * @throws {ConflictException} If the sender and receiver are already friends.
     * @throws {ConflictException} If the friend request has already been sent by the sender.
     * @throws {ConflictException} If there is already a pending friend request from the receiver to the sender.
     */
    @Post('send-friend-request/:receiver_id')
    async addFriend(
        @ExtractUserData('id') sender_id: number,
        @Param('receiver_id', ParseIntPipe) receiver_id: number,
        @Body() sendFriendRequesDto: SendFriendRequestDto,
    ): Promise<{
        response: {
            friend_request: FriendsInvitations;
        };
    }> {
        this.logger.log(
            `add friend where sender_id =  ${sender_id}, and receiver_id = ${receiver_id}`,
        );

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

        const is_receiver_sent = await this.friendsService.findOne({
            sender: { id: receiver_id },
            receiver: { id: sender_id },
            request_status: RequestStatus.PENDING,
        } as FriendsInvitations);

        if (is_receiver_sent) {
            throw new ConflictException('You already received a friend request from this user');
        }

        const friend_request = await this.friendsService.create({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
        } as FriendsInvitations);
        return {
            response: {
                friend_request,
            },
        };
    }

    /**
     * Accepts a pending friend request between two users; the receiver of the request
     * confirms the request sent by the sender, updating the request status to accept.
     *
     * @param {number} receiver_id - The ID of the user accepting the friend request (receiver).
     * @param {number} sender_id - The ID of the user who sent the friend request (sender).
     * @param {AcceptFriendRequestDto} acceptFriendRequestDto - The DTO containing the details of the friend request acceptance.
     * @return {Object} Returns an object with a message confirming the friend request acceptance.
     */
    @Patch('accept-friend-request/:sender_id')
    async acceptFriendRequest(
        @ExtractUserData('id') receiver_id: number,
        @Param('sender_id', ParseIntPipe) sender_id: number,
        @Body() acceptFriendRequestDto: AcceptFriendRequestDto,
    ): Promise<{
        response: {
            message: string;
        };
    }> {
        this.logger.log(
            `acceptFriendRequest where sender_id = ${sender_id} and receiver_id = ${receiver_id}`,
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
            response: {
                message: 'Friend request accepted',
            },
        };
    }

    /**
     * Rejects a friend request from the specified sender to the specified receiver.
     * Updates the request status to "REJECTED".
     *
     * @param {number} receiver_id - The ID of the user who is rejecting the friend request.
     * @param {number} sender_id - The ID of the user who sent the friend request.
     * @return {Object} Returns an object with a message confirming the rejection of the friend request.
     */

    @Delete('reject-friend-request/:sender_id')
    async rejectFriendRequest(
        @ExtractUserData('id') receiver_id: number,
        @Param('sender_id', ParseIntPipe) sender_id: number,
        @Body() rejectFriendRequestDto: RejectFriendRequestDto
    ): Promise<{
        response: {
            message: string;
        };
    }> {
        this.logger.log(
            `rejectFriendRequest where sender_id = ${sender_id} and receiver_id = ${receiver_id}`,
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
            response: {
                message: 'Friend request rejected',
            },
        };
    }

    /**
     * Cancels a friend request between the sender and the receiver.
     *
     * @param {number} sender_id - The ID of the user who sent the friend request.
     * @param {number} receiver_id - The ID of the user to whom the friend request was sent.
     * @return {Promise<Object>} A promise that resolves to an object containing a message confirming the cancellation of the friend request.
     */
    @Delete('cancel-friend-request/:receiver_id')
    async cancelFriendRequest(
        @ExtractUserData('id') sender_id: number,
        @Param('receiver_id', ParseIntPipe) receiver_id: number,
        @Body() cancelFriendRequestDto: CancelFriendRequestDto
    ): Promise<{
        response: {
            message: string;
        };
    }> {
        this.logger.log(
            `cancelFriendRequest where sender_id = ${sender_id} and receiver_id = ${receiver_id}`,
        );
        await this.friendsService.findOneAndDelete({
            sender: { id: sender_id },
            receiver: { id: receiver_id },
            request_status: RequestStatus.PENDING,
        });

        return {
            response: {
                message: 'Friend request cancelled',
            },
        };
    }

    /**
     * Removes a friend connection between the user and the specified friend.
     * Updates the request status to indicate the relationship has been removed.
     *
     * @param {number} user_id - The ID of the user initiating the friend removal.
     * @param {number} friend_id - The ID of the friend to be removed.
     * @return {Promise<{ message: string }>} A confirmation message indicating the friend has been removed.
     */
    @Delete('remove-friend/:friend_id')
    async removeFriend(
        @ExtractUserData('id') user_id: number,
        @Param('friend_id', ParseIntPipe) friend_id: number,
        @Body() removeFriendDto: RemoveFriendDto
    ): Promise<{
        response: {
            message: string;
        };
    }> {
        this.logger.log(`removeFriend where user_id = ${user_id} and friend_id = ${friend_id}`);

        await this.friendsService.findOneAndUpdate(
            {
                sender: { id: user_id },
                receiver: { id: friend_id },
                request_status: RequestStatus.ACCEPTED,
            },
            {
                request_status: RequestStatus.REMOVED,
            },
        );

        return {
            response: {
                message: 'Friend removed successfully',
            },
        };
    }
}
