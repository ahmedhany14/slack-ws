import { Injectable, Logger, NestMiddleware, NotFoundException } from '@nestjs/common';
import { RequestI } from '@app/interfaces';
import { ServerService } from '../servers/server.service';

@Injectable()
export class FetchServerMiddleware implements NestMiddleware {
    private readonly logger = new Logger(FetchServerMiddleware.name);

    constructor(private readonly serverService: ServerService) { }

    async use(req: RequestI, res: any, next: () => void) {
        const id = +req.params.id;

        this.logger.log('FetchServerMiddleware use called, id: ', id);

        const server = await this.serverService.findOne({ id });
        if (!server) throw new NotFoundException('Server not found');
        req.server = server;
        next();
    }
}
