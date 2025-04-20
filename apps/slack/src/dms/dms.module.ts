import { forwardRef, Module } from '@nestjs/common';
import { DmsController } from './dms.controller';

// database
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectConversation, DirectConversationMessages } from '@app/database';

// modules
import { FriendsModule } from '../friends/friends.module';

// service
import { MessagesService } from '../messages/messages.service';
import { DmsGateway } from './dms.gateway';
import { DmsService } from './dms.service';

// microservices
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';
import { IsExistConversationValidator, IsExistMessageValidator } from '@app/validators';
import { SlackModule } from '../slack.module';


@Module({
    imports: [
        forwardRef(() => SlackModule),
        TypeOrmModule.forFeature([DirectConversation]),
        FriendsModule,
        ClientsModule.registerAsync([
            // auth service
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                name: AUTH_SERVICE,
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.authAppConfig?.hostname,
                        port: configService.authAppConfig?.tcpPort,
                    },
                }),
            },
        ]),
    ],
    controllers: [DmsController],
    providers: [DmsGateway, DmsService, IsExistMessageValidator, IsExistConversationValidator],
    exports: [DmsService],
})
export class DmsModule { }
