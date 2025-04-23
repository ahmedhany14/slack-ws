import { IsExistServer, IsExistUser } from "@app/validators";
import { IsNumber, IsPositive } from "class-validator";


export class SendServerInvitationDto {
    @IsPositive()
    @IsNumber()
    @IsExistServer()
    server_id: number;

    @IsPositive()
    @IsNumber()
    @IsExistUser()
    receiver_id: number;
}