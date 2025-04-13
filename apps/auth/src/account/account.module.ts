import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '@app/database';
import { AccountController } from './account.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Account])
    ],
    providers: [AccountService],
    exports: [AccountService],
    controllers: [AccountController],
})
export class AccountModule { }
