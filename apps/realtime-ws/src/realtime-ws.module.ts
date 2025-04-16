import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';

@Module({
    imports: [LoggerModule],
})
export class RealtimeWsModule {}
