import { forwardRef, Module } from '@nestjs/common';
import { DmsController } from './dms.controller';

// database
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectConversation, DirectConversationMessages } from '@app/database';

// modules
import { RealtimeWsModule } from '../realtime-ws.module';
import { FriendsModule } from '../../friends/friends.module';

// service
import { DmsMessagesService } from './services/dms.messages.service';
import { DmsGateway } from './dms.gateway';
import { DmsService } from './services/dms.service';

// microservices
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';


@Module({
    imports: [
        TypeOrmModule.forFeature([DirectConversation, DirectConversationMessages]),
        forwardRef(() => RealtimeWsModule), // to avoid circular dependency
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
    providers: [DmsGateway, DmsService, DmsMessagesService],
    exports: [DmsService],
})
export class DmsModule { }
