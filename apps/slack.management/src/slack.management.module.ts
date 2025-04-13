import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { ServerModule } from './server/server.module';
import { NamespacesModule } from './namespaces/namespaces.module';
import { FetchServerMiddleware } from './middlewares/fetch.server.middleware';

@Module({
    imports: [
        LoggerModule,
        ServerModule,
        NamespacesModule
    ],
})
export class SlackManagementModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(FetchServerMiddleware).forRoutes({
            path: 'server/:id',
            method: RequestMethod.PATCH,
        }, {
            path: 'namespaces/:id',
            method: RequestMethod.POST,
        });
    }
}
