import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@app/config/config.module';
import { LoggerModule } from '@app/logger';
import { BcryptProvider } from './providers/bcrypt.provider';
import { DatabaseModule } from '@app/database';

@Module({
    imports: [ConfigModule, LoggerModule, DatabaseModule],
    controllers: [AuthController],
    providers: [AuthService, BcryptProvider],
})
export class AuthModule { }
