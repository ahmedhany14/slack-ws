import { IsExistServer } from "@app/validators";
import { IsNumber, IsPositive } from "class-validator";


export class DeleteNamespaceDto {

    @IsNumber()
    @IsPositive()
    @IsExistServer()
    server_id: number;

    @IsNumber()
    @IsPositive()
    //  TODO IsExistNamespace()
    namespaces_id: number;
}