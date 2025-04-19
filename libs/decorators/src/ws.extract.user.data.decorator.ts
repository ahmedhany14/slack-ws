import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SocketI } from 'apps/slack/src/realtime-ws/interfaces/socket.client.interface';

export const WsExtractUserData = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const client: SocketI = ctx.switchToWs().getClient();

        return data ? client.data.user?.[data] : client.data.user;
    },
);