import { Module } from '@nestjs/common';
import { ConfigModule as config } from '@nestjs/config';
import envValidation from './config.validations';
import { ConfigService } from './config.service';
import configuration from './configurations';

const env = process.env.NODE_ENV || 'dev';

@Module({
    imports: [
        config.forRoot({
            isGlobal: true,
            envFilePath: `.${env}.env`,
            load: [configuration],
            validationSchema: envValidation,
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
