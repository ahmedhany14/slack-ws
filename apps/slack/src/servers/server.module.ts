import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, Server, Subscribers } from '@app/database';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';

import { ServerService } from './services/server.service';
import { ServerController } from './server.controller';
import { ServersGateway } from './servers.gateway';
import { SlackModule } from '../slack.module';
import { SubscribersService } from './services/subscribers.service';
import { ServerGatewayService } from './services/server.gateway.service';
import { NamespacesModule } from '../namespaces/namespaces.module';
import { ServerChatsModule } from '../server-chats/server-chats.module';

@Module({
    imports: [
        NamespacesModule,
        forwardRef(() => ServerChatsModule),
        DatabaseModule,
        forwardRef(() => SlackModule),
        TypeOrmModule.forFeature([Server, Subscribers]),
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
    controllers: [ServerController],
    providers: [ServerService, ServersGateway, SubscribersService, ServerGatewayService],
    exports: [ServerService, SubscribersService, ServerGatewayService],
})
export class ServerModule {}
