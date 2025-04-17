import { Module } from '@nestjs/common';
import { DmsController } from './dms.controller';
import { DmsGateway } from './dms.gateway';

@Module({
    controllers: [DmsController],
    providers: [DmsGateway],
})
export class DmsModule {}
