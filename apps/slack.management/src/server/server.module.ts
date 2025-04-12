import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from '@app/database';

@Module({
    imports: [TypeOrmModule.forFeature([Server])],
    controllers: [ServerController],
    providers: [ServerService],
})
export class ServerModule {}
