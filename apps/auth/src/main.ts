import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import * as cookieParser from 'cookie-parser';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: process.env.AUTH_HOSTNAME,
            port: Number(process.env.AUTH_TCP_PORT),
        },
    });


    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    await app.startAllMicroservices().then(() => {
        console.log('Auth microservice is running');
    })

    await app.listen(process.env.AUTH_HTTP_PORT ?? 3000);
}

bootstrap().then(() => {
    console.log(`
Auth service is running on port ${process.env.AUTH_HTTP_PORT ?? 3000}
logic: ${process.env.AUTH_SERVICE_URL ?? `http://${process.env.AUTH_HOSTNAME}:${process.env.AUTH_HTTP_PORT ?? 3000}`}
microservice: on port ${process.env.AUTH_TCP_PORT ?? 3001}
`);
});
