import { NestFactory } from '@nestjs/core';
import { RealtimeWsModule } from './realtime-ws.module';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { WsDmsAdapter } from './dms/ws.dms.adapter';

async function bootstrap() {
    const app = await NestFactory.create(RealtimeWsModule);
    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: process.env.REALTIME_HOSTNAME,
            port: Number(process.env.REALTIME_TCP_PORT),
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

    // adapters
    app.useWebSocketAdapter(new WsDmsAdapter());


    await app.startAllMicroservices().then(() => {
        console.log('Realtime microservice is running');
    });

    await app.listen(process.env.REALTIME_HTTP_PORT || 8086);
}

bootstrap().then(() => {
    console.log(`
Auth service is running on port ${process.env.REALTIME_HTTP_PORT ?? 8086}
logic: ${process.env.REALTIME_SERVICE_URL ?? `http://${process.env.REALTIME_HOSTNAME}:${process.env.REALTIME_HTTP_PORT ?? 8086}`}
microservice: on port ${process.env.REALTIME_TCP_PORT ?? 8087}
`);
});
