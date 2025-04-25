import { forwardRef, Module } from '@nestjs/common';
import { ServerMessagesGateway } from './server-messages.gateway';
import { ServerModule } from '../servers/server.module';
import { SlackModule } from '../slack.module';

@Module({
    imports: [ServerModule, forwardRef(() => SlackModule)],
    controllers: [],
    providers: [ServerMessagesGateway],
})
export class ServerMessagesModule {}
