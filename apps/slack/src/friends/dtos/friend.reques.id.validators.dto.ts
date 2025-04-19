import { IsExistUser } from "@app/validators";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class SendFriendRequestDto {

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @IsExistUser()
    receiver_id: number;
}

export class AcceptFriendRequestDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @IsExistUser()
    sender_id: number;
}

export class RejectFriendRequestDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @IsExistUser()
    sender_id: number;
}

export class CancelFriendRequestDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @IsExistUser()
    receiver_id: number;
}

export class RemoveFriendDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @IsExistUser()
    friend_id: number;
}

