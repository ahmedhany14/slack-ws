
import { PartialType } from "@nestjs/mapped-types";
import { CreateNamespaceDto } from "./create.namespace.dto";
import { IsNumber, IsPositive } from "class-validator";
import { IsExistServer } from "@app/validators";

export class UpdateNamespaceDto extends PartialType(CreateNamespaceDto) {
    @IsNumber()
    @IsPositive()
    @IsExistServer()
    server_id: number;

    @IsNumber()
    @IsPositive()
    //  TODO IsExistNamespace()
    namespaces_id: number;
}