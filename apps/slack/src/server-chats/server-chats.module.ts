import { forwardRef, Module } from '@nestjs/common';
import { ServerChatsGateway } from './server-chats.gateway';
import { ServerModule } from '../servers/server.module';
import { SlackModule } from '../slack.module';

@Module({
    imports: [ServerModule, forwardRef(() => SlackModule)],
    controllers: [],
    providers: [ServerChatsGateway],
})
export class ServerChatsModule {}
