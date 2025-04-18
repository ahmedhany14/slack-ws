import { AllowedServerUpdateGuard, AuthGuard } from '@app/auth.common';
import {
    Body,
    Controller,
    Get,
    Inject,
    Logger,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { NamespacesService } from './namespaces.service';
import { Namespaces } from '@app/database';
import { CreateNamespaceDto } from './dtos/create.namespace.dto';

@Controller('namespaces')
export class NamespacesController {
    private readonly logger: Logger = new Logger(NamespacesController.name);

    constructor(
        @Inject()
        private readonly namespacesService: NamespacesService,
    ) { }


    /**
     * Endpoint to create a new namespace on a servers.
     * This endpoint is protected by authentication and authorization guards.
     * Users should be allowed to create namespaces only on servers they own, or he is an admin on this servers
     * @param server_id - The ID of the servers where the namespace will be created.
     * @param createNamespaceDto - The DTO containing the namespace data.
     * @returns The created namespace object.
     */
    @UseGuards(AuthGuard, AllowedServerUpdateGuard)
    @Post(':id')
    async createNamespace(
        @Param('id', ParseIntPipe) server_id: number,
        @Body() createNamespaceDto: CreateNamespaceDto,
    ) {
        this.logger.log(`creating namespace on server, id: ${server_id}`);
        return await this.namespacesService.create({
            name: createNamespaceDto.name,
            server: { id: server_id },
        } as Namespaces);
    }

    // TODO: add endpoint to get all namespaces on a servers
    /**
     * Endpoint to get all namespaces on a servers.
     * This endpoint is protected by authentication and authorization guards.
     * Server should be exist
     * User should be member of the servers to get all namespaces on this servers
     * @param server_id
     * @returns The list of namespaces on the servers.
     */
}
