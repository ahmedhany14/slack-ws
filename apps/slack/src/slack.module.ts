import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

// modules
import { ServerModule } from './servers/server.module';
import { NamespacesModule } from './namespaces/namespaces.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { DatabaseModule } from '@app/database';
import { FriendsModule } from './friends/friends.module';
import { RealtimeWsModule } from './realtime-ws/realtime-ws.module';
import {
    IsExistConversationValidator,
    IsExistServerValidator,
    IsExistUserValidator,
} from '@app/validators';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter, ResponseInterceptor } from '@app/interceptors';

@Module({
    imports: [
        FriendsModule,
        ServerModule,
        NamespacesModule,
        SubscribersModule,
        RealtimeWsModule,
        DatabaseModule,
    ],
    controllers: [SlackController],
    providers: [
        SlackService,
        IsExistConversationValidator,
        IsExistServerValidator,
        IsExistUserValidator, // Interceptors
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },

        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class SlackModule {}
