import { AuthGuard } from '@app/auth.common';
import {
    Body,
    ConflictException,
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
import { GetServerNameSpacesDto } from './dtos/get.server.name.spaces.dto';

@Controller('namespaces')
export class NamespacesController {
    private readonly logger: Logger = new Logger(NamespacesController.name);

    constructor(
        @Inject()
        private readonly namespacesService: NamespacesService,
    ) { }

    /**
     * Creates a namespace associated with a specific server.
     * Logs the operation and delegate to the namespace service to perform the creation.
     *
     * @param {number} server_id - The ID of the server on which the namespace will be created.
     * @param {CreateNamespaceDto} createNamespaceDto - The data transfer object that contains the details of the namespace to be created.
     * @returns {Promise<{ response: { namespace: Namespaces } }>} - A promise that resolves to an object containing the created namespace.
     */
    @UseGuards(AuthGuard)
    @Post(':id')
    async createNamespace(
        @Param('id', ParseIntPipe) server_id: number,
        @Body() createNamespaceDto: CreateNamespaceDto,
    ): Promise<{ response: { namespace: Namespaces } }> {
        this.logger.log(`creating namespace on server, id: ${server_id}`);

        const namespace = await this.namespacesService.create({
            name: createNamespaceDto.name,
            server: { id: server_id },
        } as Namespaces);

        return {
            response: {
                namespace,
            },
        };
    }
    /*
     DONE: Server should exist Decorator (in body)
     TODO: User should be a member of the servers to get all namespaces on this servers
     */
    /**
     * Retrieves namespaces associated with a specific server.
     *
     * @param {number} server_id - The ID of the server for which the namespaces are retrieved.
     * @return {Promise<{ response: { namespaces: Namespaces[] } }>} A promise that resolves to an object containing the namespaces.
     */
    @Get(':server_id')
    async getServerNamespaces(
        @Param('server_id', ParseIntPipe) server_id: number,
        @Body() getServerNameSpacesDto: GetServerNameSpacesDto
    ): Promise<{ response: { namespaces: Namespaces[] } }> {
        if (server_id != getServerNameSpacesDto.server_id) {
            throw new ConflictException({
                message: 'server_id in body and url should be same',
            })
        }

        this.logger.log(`getting namespaces on server, id: ${server_id}`);

        const namespaces = await this.namespacesService.find({
            server: { id: server_id },
        });

        return {
            response: {
                namespaces,
            },
        };
    }
}
