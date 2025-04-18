import { Module } from '@nestjs/common';
import { DmsModule } from './dms/dms.module';
import { DatabaseModule } from '@app/database';
import { RealtimeWsAuthService } from './realtime-ws.auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';

@Module({
    imports: [
        DmsModule,
        DatabaseModule,
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
    providers: [RealtimeWsAuthService],
    exports: [RealtimeWsAuthService]
})
export class RealtimeWsModule { }
