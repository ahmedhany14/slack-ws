import { IsExistServer, IsExistUser } from "@app/validators";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";


enum UserRole {
    ADMIN = 'admin',
    MEMBER = 'member',
}

export class UserRoleChangeDto {

    @IsNumber()
    @IsPositive()
    @IsExistUser()
    user_id: number;

    @IsNumber()
    @IsPositive()
    @IsExistServer()
    server_id: number;

    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}