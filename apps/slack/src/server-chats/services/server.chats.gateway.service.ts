import { Inject, Injectable } from '@nestjs/common';
import { ServerChatService } from './server.chat.service';
import { ServerChatMessagesService } from './server.chat.messages.service';
import { ServerChat } from '@app/database';

@Injectable()
export class ServerChatsGatewayService {

    constructor(
        @Inject()
        private readonly serverChatService: ServerChatService,
        @Inject()
        private readonly serverChatMessagesService: ServerChatMessagesService,
    ) { }

    async createServerChat(
        namespace_id: number
    ) {
        return await this.serverChatService.create({
            name: 'general',
            namespace: { id: namespace_id },
        } as ServerChat);
    }
}
