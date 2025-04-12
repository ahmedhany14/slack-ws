import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, Server } from '@app/database';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';

import { ServerService } from './server.service';
import { ServerController } from './server.controller';

@Module({
    imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([Server]),
        ClientsModule.registerAsync([
            // auth service
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                name: AUTH_SERVICE,
                useFactory: (configService: ConfigService) => (
                    console.log(configService.authAppConfig),
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
    controllers: [ServerController],
    providers: [ServerService],
})
export class ServerModule {}
