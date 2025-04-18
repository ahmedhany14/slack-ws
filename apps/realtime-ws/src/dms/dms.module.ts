import { forwardRef, Module } from '@nestjs/common';
import { DmsController } from './dms.controller';
import { DmsGateway } from './dms.gateway';
import { DmsService } from './dms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectConversation } from '@app/database';
import { RealtimeWsModule } from '../realtime-ws.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@app/config';
import { AUTH_SERVICE } from '@app/constants';

@Module({
    imports: [
        TypeOrmModule.forFeature([DirectConversation]),
        forwardRef(() => RealtimeWsModule), // to avoid circular dependency
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
export class DmsModule { }
