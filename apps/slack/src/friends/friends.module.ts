import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabaseModule, FriendsInvitations } from '@app/database';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';

import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendsGateway } from './friends.gateway';
import { SlackModule } from '../slack.module';


@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => SlackModule),
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
    providers: [FriendsService, FriendsGateway],
    exports: [FriendsService]

})
export class FriendsModule { }
