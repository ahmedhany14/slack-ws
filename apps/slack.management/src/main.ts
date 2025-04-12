import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

import { SlackManagementModule } from './slack.management.module';

async function bootstrap() {
    const app = await NestFactory.create(SlackManagementModule);

    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: process.env.SLACK_HOSTNAME,
            port: Number(process.env.SLACK_TCP_PORT),
        },
    });

    app.use(
        cookieParser({
            maxAge: 60 * 60 * 24 * 7, // 1 week
            httpOnly: true,
        }),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.useLogger(app.get(Logger));

    await app.startAllMicroservices().then(() => {
        console.log('Slack microservice is running');
    });

    await app.listen(process.env.SLACK_HTTP_PORT ?? 3000);
}

bootstrap().then(() => {
    console.log(`
slack service is running on port ${process.env.SLACK_HTTP_PORT ?? 3000}
logic: ${process.env.SLACK_SERVICE_URL ?? `http://${process.env.SLACK_HOSTNAME}:${process.env.SLACK_HTTP_PORT ?? 3000}`}
microservice: on port ${process.env.SLACK_TCP_PORT ?? 3001}
`);

});
