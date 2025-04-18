import { Module } from '@nestjs/common';
import { DmsController } from './dms.controller';
import { DmsGateway } from './dms.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';
import { DmsService } from './dms.service';

@Module({
    imports: [
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
    providers: [DmsGateway, DmsService],
})
export class DmsModule {}
