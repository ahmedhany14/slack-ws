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

    constructor(@Inject() private readonly serverService: ServerService) { }


    /**
     * Endpoint to create a new server.
     * Any Authenticated user can create a server.
     * @param createServerDto data to create a new server
     * @param id owner of the server
     * @returns the created server
     */
    @UseGuards(AuthGuard)
    @Post()
    async create(@Body() createServerDto: CreateServerDto, @ExtractUserData('id') id: number) {
        this.logger.log(`creating server, id: ${id}`);

        return await this.serverService.create({
            name: createServerDto.name,
            description: createServerDto.description,
            owner: { id },
        } as Server);
    }

    /**
     * Endpoint to update a server.
     * Only the owner of the server can update it.
     * This endpoint is protected by authentication and authorization guards.
     * User should be allowed to update the server only if he is the owner of the server or he is an admin on this server
     * @param updateServerDto data to update the server
     * @param id id of the server to update
     * @returns the updated server
     */
    @UseGuards(AuthGuard, AllowedServerUpdateGuard)
    @Patch(':id')
    async update(@Body() updateServerDto: UpdateServerDto, @Param('id') id: number) {
        this.logger.log(`updating server, id: ${id}`);

        const server = await this.serverService.findOneAndUpdate({ id }, { ...updateServerDto });

        return {
            message: 'Server metadata updated successfully',
            server,
        };
    }

    // TODO: create a new endpoint to send an invetation to the users to join the server
    /**
     * Endpoint to send an invitation to a user to join the server.
     * This endpoint is protected by authentication and authorization guards.
     * User should be allowed to send an invitation, based on the server role, (owner, admin only) or any user
     * Check if user is already existing 
     * Check if user is already a member of the server
     * Check if user is already invited to the server
     * @param id id of the server to send the invitation to
     * @param user_id id of the user to send the invitation to
     * @returns the invitation
     */


    /**
     * Message pattern to get server details.
     * This is a microservice pattern.
     * This endpoint is protected by authentication and authorization guards.
     * User should be member of the server to get all namespaces on this server
     * @param id id of the server to get details
     * @returns the server details
     */
    // TODO: add another auth guard to check if the user is a member of the server
    @UseGuards(AuthGuard)
    @MessagePattern('server.get.details')
    async getServerDetails(@Payload('id') id: number) {
        this.logger.log(`getting server details, id: ${id}`);

        return await this.serverService.findOne({ id });
    }
}
