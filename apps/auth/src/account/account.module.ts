import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '@app/database';

@Module({
    imports: [
        TypeOrmModule.forFeature([Account])
    ],
    providers: [AccountService],
    exports: [AccountService],
})
export class AccountModule { }
