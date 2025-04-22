import { forwardRef, Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectConversation, DirectConversationMessages } from '@app/database';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { DmsModule } from '../dms/dms.module';
import { SlackModule } from '../slack.module';
import { FriendsModule } from '../friends/friends.module';

@Module({
    imports: [
        forwardRef(() => SlackModule),
        FriendsModule,
        TypeOrmModule.forFeature([DirectConversation, DirectConversationMessages]),
        DmsModule,
    ],
    controllers: [MessagesController],
    providers: [MessagesService, MessagesGateway],
})
export class MessagesModule { }
