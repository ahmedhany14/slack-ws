import { forwardRef, Module } from '@nestjs/common';
import { NamespacesController } from './namespaces.controller';
import { Namespaces } from '@app/database/entities/namespaces.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NamespacesService } from './namespaces.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';
import { NamespacesGateway } from './namespaces.gateway';
import { SlackModule } from '../slack.module';
import { ServerModule } from '../servers/server.module';

@Module({
    imports: [
        forwardRef(() => ServerModule),
        forwardRef(() => SlackModule),
        TypeOrmModule.forFeature([Namespaces]),
        ClientsModule.registerAsync([
            // auth service
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                name: AUTH_SERVICE,
                useFactory: (configService: ConfigService) => (
                    {
                        transport: Transport.TCP,
                        options: {
                            host: configService.authAppConfig?.hostname,
                            port: configService.authAppConfig?.tcpPort,
                        },
                    }
                ),
            },
        ]),

    ],
    controllers: [NamespacesController],
    providers: [NamespacesService, NamespacesGateway],
    exports: [NamespacesService],
})
export class NamespacesModule { }
