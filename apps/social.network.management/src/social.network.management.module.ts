import { LoggerModule } from '@app/logger';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        LoggerModule,
    ],
})
export class SocialNetworkManagementModule { }
