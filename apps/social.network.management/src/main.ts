import { NestFactory } from '@nestjs/core';
import { SocialNetworkManagementModule } from './social.network.management.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
    const app = await NestFactory.create(SocialNetworkManagementModule);

    // Enable CORS
    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: process.env.SOCIAL_NETWORK_HOSTNAME,
            port: Number(process.env.SOCIAL_NETWORK_TCP_PORT),
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
        console.log('Social Network microservice is running');
    });

    await app.listen(parseInt(process.env.SOCIAL_NETWORK_HTTP_PORT || '8084'));
}
bootstrap().then(() => {
    console.log(`
social network service is running on port ${process.env.SOCIAL_NETWORK_HTTP_PORT || 8084}
logic: ${process.env.SOCIAL_NETWORK_SERVICE_URL || `http://${process.env.SOCIAL_NETWORK_HOSTNAME}:${process.env.SOCIAL_NETWORK_HTTP_PORT || 8084}`}
microservice: on port ${process.env.SOCIAL_NETWORK_TCP_PORT || 8085}
`);
});


