import { LoggerModule } from '@app/logger';
import { Module } from '@nestjs/common';
import { FriendsModule } from './friends/friends.module';

@Module({
    imports: [
        LoggerModule,
        FriendsModule,
    ],
})
export class SocialNetworkManagementModule { }
