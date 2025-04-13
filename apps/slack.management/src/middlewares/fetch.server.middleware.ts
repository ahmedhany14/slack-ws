import { Injectable, Logger, NestMiddleware, NotFoundException } from '@nestjs/common';
import { RequestI } from '@app/interfaces';
import { ServerService } from '../server/server.service';

@Injectable()
export class FetchServerMiddleware implements NestMiddleware {
    private readonly logger = new Logger(FetchServerMiddleware.name);

    constructor(private readonly serverService: ServerService) { }

    async use(req: RequestI, res: any, next: () => void) {
        console.log('FetchServerMiddleware');
        const id = +req.params.id;
        console.log('id', id, req.params);
        const server = await this.serverService.findOne({ id });
        if (!server) throw new NotFoundException('Server not found');
        req.server = server;
        next();
    }
}
