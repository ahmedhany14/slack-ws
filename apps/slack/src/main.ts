import { NestFactory } from '@nestjs/core';
import { SlackModule } from './slack.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(SlackModule);
    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: process.env.SLACK_HOSTNAME,
            port: Number(process.env.SLACK_TCP_PORT),
        },
    });


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
