import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
    imports: [
        PinoLoggerModule.forRoot({
            pinoHttp: {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        level: 'trace',
                        singleLine: true,
                        colorize: true,
                        translateTime: 'HH:MM:ss Z',
                        ignore: 'pid,hostname',
                    },
                },
                base: {
                    env: process.env.NODE_ENV || 'development',
                },
                messageKey: 'message',
                timestamp: () => `,"time":"${new Date().toISOString()}"`,
                formatters: {
                    level(label) {
                        return { level: label.toUpperCase() };
                    },
                    bindings(bindings) {
                        return { pid: bindings.pid, host: bindings.hostname };
                    },
                    log(object) {
                        return { ...object, custom: 'extra-info' };
                    },
                },
            },
        }),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class LoggerModule {}
