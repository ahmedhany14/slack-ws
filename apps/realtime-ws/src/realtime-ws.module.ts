import { Module } from '@nestjs/common';
import { DmsModule } from './dms/dms.module';
import { DatabaseModule } from '@app/database';

@Module({
    imports: [DmsModule, DatabaseModule,],
})
export class RealtimeWsModule { }
