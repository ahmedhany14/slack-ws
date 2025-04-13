import { Body, Controller, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';

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
    constructor(@Inject() private readonly serverService: ServerService) { }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Body() createServerDto: CreateServerDto, @ExtractUserData('id') id: number) {
        console.log(id);

        return await this.serverService.create({
            name: createServerDto.name,
            description: createServerDto.description,
            owner: { id },
        } as Server);
    }

    @UseGuards(AuthGuard, AllowedServerUpdateGuard)
    @Patch(':id')
    async update(@Body() updateServerDto: UpdateServerDto, @Param('id') id: number) {
        const server = await this.serverService.findOneAndUpdate({ id }, { ...updateServerDto });

        return {
            message: 'Server metadata updated successfully',
            server,
        };
    }
    @UseGuards(AuthGuard)
    @MessagePattern('server.get.details')
    async getServerDetails(@Payload('id') id: number) {
        return await this.serverService.findOne({ id });
    }
}
