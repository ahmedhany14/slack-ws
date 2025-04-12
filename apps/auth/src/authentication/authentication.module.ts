import { Module } from '@nestjs/common';

// modules
import { AccountModule } from '../account/account.module';
import { JwtModule } from '@nestjs/jwt';

// libraries
import { ConfigModule } from '@app/config/config.module';
import { LoggerModule } from '@app/logger';
import { DatabaseModule } from '@app/database';

// module controllers and services
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { BcryptProvider } from './providers/bcrypt.provider';
import { TokenProvider } from './providers/token.provider';


@Module({
    imports: [ConfigModule, LoggerModule, DatabaseModule, AccountModule, JwtModule],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, BcryptProvider, TokenProvider],
    exports: [],
})
export class AuthenticationModule { }
