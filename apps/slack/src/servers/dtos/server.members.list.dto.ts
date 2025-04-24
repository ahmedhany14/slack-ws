import { IsExistServer } from "@app/validators";
import { IsNumber, IsPositive } from "class-validator";


export class ServerMembersListDto {
    @IsNumber()
    @IsPositive()
    @IsExistServer()
    server_id: number;
}