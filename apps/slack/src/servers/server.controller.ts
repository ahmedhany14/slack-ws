import {
    Body,
    ConflictException,
    Controller,
    Inject,
    Logger,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

// libraries
import { AuthGuard } from '@app/auth.common';
import { ExtractUserData } from '@app/decorators';
import { Server } from '@app/database';

// service
import { ServerService } from './server.service';

// dto
import { CreateServerDto } from './dtos/create.server.dto';
import { UpdateServerDto } from './dtos/update.server.dto';
import { IsServerOwner } from './guards/is.server.owner';

@Controller('server')
export class ServerController {
    private readonly logger: Logger = new Logger(ServerController.name);

    constructor(@Inject() private readonly serverService: ServerService) {}

    /**
     * Creates a new server using the provided data and user id.
     *
     * @param {CreateServerDto} createServerDto - The DTO containing the server creation details, such as name and description.
     * @param {number} id - The ID of the user creating the server, extracted from the user data.
     * @returns {Promise<{ response: { server: Server } }>} - A promise that resolves to an object containing the created server.
     */
    @UseGuards(AuthGuard)
    @Post()
    async create(
        @Body() createServerDto: CreateServerDto,
        @ExtractUserData('id') id: number,
    ): Promise<{
        response: {
            server: Server;
        };
    }> {
        this.logger.log(`creating server, id: ${id}`);

        const server = await this.serverService.create({
            name: createServerDto.name,
            description: createServerDto.description,
            owner: { id },
        } as Server);

        return {
            response: {
                server,
            },
        };
    }

    // DONE: add is existing server decorator to check if the server exists, in body
    /**
     * Updates server metadata based on the given ID and input data.
     *
     * @param {UpdateServerDto} updateServerDto - The data transfer object containing the updated server information.
     * @param {number} serverId - The unique identifier of the server to be updated.
     * @returns {Promise<{ response: { server: Server } }>} - A promise that resolves to an object containing the updated server.
     */
    @UseGuards(AuthGuard, IsServerOwner)
    @Patch(':server_id')
    async update(
        @Param('server_id') serverId: number,
        @Body() updateServerDto: UpdateServerDto,
    ): Promise<{
        response: {
            server: Server;
        };
    }> {
        this.logger.log(`updating server, id: ${serverId}`);
        if (serverId !== updateServerDto.server_id) {
            throw new ConflictException({
                message: 'server_id in body and url should be same',
            });
        }

        const { server_id, ...updateData } = updateServerDto;
        const server = (await this.serverService.findOneAndUpdate(
            {
                id: server_id,
            },
            updateData,
        )) as Server;

        return {
            response: {
                server,
            },
        };
    }

    // TODO: create a new endpoint to send an invitation to the users to join the servers
    /**
     * Endpoint to send an invitation to a user to join the servers.
     * This endpoint is protected by authentication and authorization guards.
     * User should be allowed to send an invitation, based on the servers role, (owner, admin only) or any user
     * Check if user is already existing
     * Check if user is already a member of the servers
     * Check if user is already invited to the servers
     * @param id id of the servers to send the invitation to
     * @param user_id id of the user to send the invitation to
     * @returns the invitation
     */
}
