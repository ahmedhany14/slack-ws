import { Module } from '@nestjs/common';

// modules
import { ServerModule } from './servers/server.module';
import { NamespacesModule } from './namespaces/namespaces.module';
import { DatabaseModule } from '@app/database';
import { FriendsModule } from './friends/friends.module';
import { DmsModule } from './dms/dms.module';

// Microservices
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';

// filters
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter, ResponseInterceptor } from '@app/interceptors';

// dto validators
import {
    IsExistConversationValidator,
    IsExistServerValidator,
    IsExistUserValidator,
} from '@app/validators';

// services
import { WsAuthenticateUserService } from './common/ws.authenticate.user.service';
import { MessagesModule } from './messages/messages.module';
import { ServerChatsModule } from './server-chats/server-chats.module';

@Module({
    imports: [
        FriendsModule,
        ServerModule,
        NamespacesModule,
        DatabaseModule,
        DmsModule,
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
        MessagesModule,
        ServerChatsModule,
    ],
    providers: [
        WsAuthenticateUserService,
        IsExistConversationValidator,
        IsExistServerValidator,
        IsExistUserValidator,
        // Global filters and interceptors
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
    exports: [WsAuthenticateUserService],
})
export class SlackModule {}
