import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule, FriendsInvitations } from '@app/database';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';

import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';


@Module({
    imports: [
        DatabaseModule,
        TypeOrmModule.forFeature([
            FriendsInvitations
        ]),
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
    controllers: [
        FriendsController
    ],
    providers: [FriendsService],
    exports: [FriendsService]

})
export class FriendsModule { }
