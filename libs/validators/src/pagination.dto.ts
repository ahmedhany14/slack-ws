import { IsInt, IsPositive } from 'class-validator';
export class PaginationDto {

    @IsInt()
    @IsPositive()
    page: number;

}
