import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

// middlewares
import { FetchServerMiddleware } from './middlewares/fetch.server.middleware';

// modules
import { ServerModule } from './servers/server.module';
import { NamespacesModule } from './namespaces/namespaces.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { DatabaseModule } from '@app/database';
import { FriendsModule } from './friends/friends.module';
import { RealtimeWsModule } from './realtime-ws/realtime-ws.module';

@Module({
    imports: [
        FriendsModule,
        ServerModule,
        NamespacesModule,
        SubscribersModule,
        RealtimeWsModule,
        DatabaseModule
    ],
    controllers: [SlackController],
    providers: [SlackService],
})
export class SlackModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(FetchServerMiddleware).forRoutes(
            {
                path: 'servers/:id',
                method: RequestMethod.PATCH,
            },
            {
                path: 'namespaces/:id',
                method: RequestMethod.POST,
            },
        );
    }
}
