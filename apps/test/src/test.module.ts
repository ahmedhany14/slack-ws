import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@app/config/config.module';
import { ConfigService } from '@app/config/config.service';
import { AUTH_SERVICE } from '@app/constants';

@Module({
    imports: [
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
                }),
            },
        ]),
    ],
    controllers: [TestController],
    providers: [TestService],
})
export class TestModule {}
