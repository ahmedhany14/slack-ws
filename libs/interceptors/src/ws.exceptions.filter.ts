import { ArgumentsHost, Catch, Logger, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionsFilter implements WsExceptionFilter {
    private readonly logger = new Logger(WsExceptionsFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const client = ctx.getClient<Socket>();

        // Detailed logging
        this.logger.error('WebSocket Exception', exception);

        // Standardize error response
        const errorResponse = {
            type: 'ws_error',
            message: exception instanceof WsException
                ? exception.getError().toString()
                : 'Unexpected error occurred',
            timestamp: new Date().toISOString()
        };

        // Emit error to client
        client.emit('error', errorResponse);

        // Disconnect client
        client.disconnect(true);
    }
}
