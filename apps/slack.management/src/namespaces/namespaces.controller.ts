import { AllowedServerUpdateGuard, AuthGuard } from '@app/auth.common';
import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { NamespacesService } from './namespaces.service';
import { Namespaces } from '@app/database';


@Controller('namespaces')
export class NamespacesController {

    constructor(
        @Inject()
        private readonly namespacesService: NamespacesService,
    ) {
    }

    @UseGuards(AuthGuard, AllowedServerUpdateGuard)
    @Post(':id')
    async createNamespace(
        @Param('id', ParseIntPipe) server_id: number,
        @Body() createNamespaceDto: { name: string },
    ) {

        return await this.namespacesService.create({
            name: createNamespaceDto.name,
            server: { id: server_id }
        } as Namespaces)
    }
}
