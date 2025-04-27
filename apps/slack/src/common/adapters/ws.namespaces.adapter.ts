import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket } from 'socket.io';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

export class WsNameSpacesAdapter extends IoAdapter {
    private readonly logger: Logger = new Logger(WsNameSpacesAdapter.name);

    createIOServer(port: number, options?: ServerOptions): Server {
        const Options = {
            ...options,
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                credentials: true,
            },
            allowEIO3: true,
            transports: ['websocket', 'polling'],
        };
        const server: Server = super.createIOServer(port, Options);

        server.of('/namespaces').use((socket: Socket, next) => {
            this.logger.log('Socket connected to /namespaces namespace');
            return next();
        });
        return server;
    }
}
