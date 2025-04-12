import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { RequestI } from '@app/interfaces';
import { ServerService } from '../server.service';

@Injectable()
export class FetchServerMiddleware implements NestMiddleware {
    constructor(private readonly serverService: ServerService) {}

    async use(req: RequestI, res: any, next: () => void) {
        const id = +req.params.id;
        const server = await this.serverService.findOne({ id });
        if (!server) throw new NotFoundException('Server not found');
        req.server = server;
        next();
    }
}
