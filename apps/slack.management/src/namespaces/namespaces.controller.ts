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
    ) {}

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
}
