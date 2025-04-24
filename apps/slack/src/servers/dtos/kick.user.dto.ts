import { IsExistServer, IsExistUser } from "@app/validators";
import { IsNumber, IsPositive } from "class-validator";


export class KickUserDto {

    @IsNumber()
    @IsPositive()
    @IsExistUser()
    user_id: number;

    @IsNumber()
    @IsPositive()
    @IsExistServer()
    server_id: number;
 
    // TODO: in the future, we can add a reason for the kick and tell the user
    //reason?: string;
}