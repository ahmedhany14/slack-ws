import { Module } from '@nestjs/common';
import { DmsModule } from './dms/dms.module';

@Module({
    imports: [DmsModule],
})
export class RealtimeWsModule {}
