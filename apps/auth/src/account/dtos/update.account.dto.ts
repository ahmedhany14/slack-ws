import { IsBoolean, IsOptional } from "class-validator";

export class UpdateAccountDto {
    @IsOptional()
    @IsBoolean()
    anyone_dm: boolean;
}