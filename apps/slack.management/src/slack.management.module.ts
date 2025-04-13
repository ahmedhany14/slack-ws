import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { ServerModule } from './server/server.module';
import { NamespacesModule } from './namespaces/namespaces.module';

@Module({
  imports: [
      LoggerModule,
      ServerModule,
      NamespacesModule
  ],
})
export class SlackManagementModule {}
