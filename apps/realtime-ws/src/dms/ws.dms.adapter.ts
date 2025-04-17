import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { Server } from 'socket.io';

export class WsDmsAdapter extends IoAdapter {
    createIOServer(port: number, options?: ServerOptions): Server {
        const serverOptions: {
            path: string;
            cors: { origin: string; methods: string[]; credentials: boolean };
            allowEIO3: boolean;
            transports: string[];
        } = {
            ...options,
            path: options?.path || '/socket.io',
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                credentials: true,
            },
            allowEIO3: true,
            transports: ['websocket', 'polling'],
        };

        const server = super.createIOServer(port, serverOptions);
        server.of('/dms').use((socket, next) => {
            console.log('Socket connected to /dms namespace');
            return next();
        });

        return server;
    }
}
