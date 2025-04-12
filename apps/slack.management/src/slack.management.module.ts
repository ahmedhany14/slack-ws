import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { ServerModule } from './server/server.module';

@Module({
  imports: [
      LoggerModule,
      ServerModule
  ],
})
export class SlackManagementModule {}
