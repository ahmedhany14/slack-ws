import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@app/config/config.module';
import { LoggerModule } from '@app/logger';
import { BcryptProvider } from './providers/bcrypt.provider';
import { AccountModule } from './account/account.module';

@Module({
    imports: [ConfigModule, LoggerModule, AccountModule],
    controllers: [AuthController],
    providers: [AuthService, BcryptProvider],
})
export class AuthModule {}
