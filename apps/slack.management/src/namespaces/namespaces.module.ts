import { Module } from '@nestjs/common';
import { NamespacesController } from './namespaces.controller';

@Module({
    controllers: [NamespacesController]
})
export class NamespacesModule { }
