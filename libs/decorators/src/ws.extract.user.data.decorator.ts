import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { SocketI } from '@app/interfaces/socket.client.interface';

export const WsExtractUserData = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const client: SocketI = ctx.switchToWs().getClient();
        return data ? client.data.user?.[data] : client.data.user;
    },
);