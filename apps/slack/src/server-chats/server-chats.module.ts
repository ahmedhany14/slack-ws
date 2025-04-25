import { forwardRef, Module } from '@nestjs/common';
import { ServerChatsGateway } from './server-chats.gateway';
import { ServerModule } from '../servers/server.module';
import { SlackModule } from '../slack.module';
import { ServerChatsGatewayService } from './services/server.chats.gateway.service';
import { ServerChatService } from './services/server.chat.service';
import { ServerChatMessagesService } from './services/server.chat.messages.service';
import { ServerChat, ServerChatMessages } from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ServerChat,
            ServerChatMessages
        ]),
        ServerModule,
        forwardRef(() => SlackModule)

    ],
    controllers: [],
    providers: [ServerChatsGateway, ServerChatsGatewayService, ServerChatService, ServerChatMessagesService],
})
export class ServerChatsModule { }
