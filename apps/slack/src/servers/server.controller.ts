import { Body, Controller, Inject, Logger, Param, Patch, Post, UseGuards } from '@nestjs/common';

// libraries
import { AllowedServerUpdateGuard, AuthGuard } from '@app/auth.common';
import { ExtractUserData } from '@app/decorators';
import { Server } from '@app/database';

// service
import { ServerService } from './server.service';

// dto
import { CreateServerDto } from './dtos/create.server.dto';
import { UpdateServerDto } from './dtos/update.server.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('server')
export class ServerController {
    private readonly logger: Logger = new Logger(ServerController.name);

    constructor(@Inject() private readonly serverService: ServerService) {}

    /**
     * Endpoint to create a new servers.
     * Any Authenticated user can create a servers.
     * @param createServerDto data to create a new servers
     * @param id owner of the servers
     * @returns the created servers
     */

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

    // TODO: add is existing server decorator to check if the server exists, in body
    /**
     * Updates server metadata based on the given ID and input data.
     *
     * @param {UpdateServerDto} updateServerDto - The data transfer object containing the updated server information.
     * @param {number} server_id - The unique identifier of the server to be updated.
     * @returns {Promise<{ response: { server: Server } }>} - A promise that resolves to an object containing the updated server.
     */
    @UseGuards(AuthGuard, AllowedServerUpdateGuard)
    @Patch(':server_id')
    async update(
        @Body() updateServerDto: UpdateServerDto,
        @Param('server_id') server_id: number,
    ): Promise<{
        response: {
            server: Server;
        };
    }> {
        this.logger.log(`updating server, id: ${server_id}`);

        const server = await this.serverService.findOneAndUpdate(
            {
                id: server_id,
            },
            { ...updateServerDto },
        ) as Server;

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
