import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { ConfigService } from '@app/config/config.service';
import { ConfigModule } from '@app/config/config.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.dbConfig?.host || 'localhost',
                port: configService.dbConfig?.port || 5432,
                username: configService.dbConfig?.username || 'postgres',
                password: configService.dbConfig?.password || 'postgres',
                database: configService.dbConfig?.database || 'slack_ws_db',
                synchronize: true,
                autoLoadEntities: true,
                namingStrategy: new SnakeNamingStrategy(),
                logger: 'advanced-console', // Use the advanced console logger
            }),
        }),
        TypeOrmModule.forFeature([
            Account
        ])
    ],
})
export class DatabaseModule { }
