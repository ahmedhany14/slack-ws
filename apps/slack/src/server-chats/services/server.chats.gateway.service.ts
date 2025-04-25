import { Inject, Injectable } from '@nestjs/common';
import { ServerChatService } from './server.chat.service';
import { ServerChatMessagesService } from './server.chat.messages.service';

@Injectable()
export class ServerChatsGatewayService {

    constructor(
        @Inject()
        private readonly serverChatService: ServerChatService,
        @Inject()
        private readonly serverChatMessagesService: ServerChatMessagesService,
    ) {    }

}
