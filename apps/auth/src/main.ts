import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: process.env.HOSTNAME,
            port: Number(process.env.TCP_PORT ?? 3001),
        },
    });

    app.use(
        cookieParser({
            maxAge: 60 * 60 * 24 * 7, // 1 week
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        }),
    );
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );
    app.useLogger(app.get(Logger));

    await app.listen(process.env.HTTP_PORT ?? 3000);
}

bootstrap().then(() => {
    console.log(`
Auth service is running on port ${process.env.HTTP_PORT ?? 3000}
logic: ${process.env.AUTH_SERVICE_URL ?? `http://${process.env.HOSTNAME}:${process.env.HTTP_PORT ?? 3000}`}
microservice: on port ${process.env.TCP_PORT ?? 3001}
`);
});
