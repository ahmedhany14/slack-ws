import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch(HttpException)
export class HttpExceptionFilter<T> implements ExceptionFilter {
    constructor(private readonly configService: ConfigService) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const errorResponse = exception.getResponse();

        const startTime = request['startTime'] || Date.now();
        const responseTime = `${Date.now() - startTime}ms`;

        let errorMessage = 'Unknown error occurred';
        let errorDetails = 'No further details available.';

        if (typeof errorResponse === 'object' && errorResponse !== null) {
            errorMessage = (errorResponse as any).message || errorMessage;
            errorDetails = (errorResponse as any).details || errorDetails;
        } else if (typeof errorResponse === 'string') {
            errorMessage = errorResponse;
        }

        response.status(status).json({
            status: 'fail',
            code: status,
            data: null,
            error: {
                message: errorMessage,
                details: errorDetails,
            },
            meta: {
                total: 0,
                page: 0,
                per_page: 0,
            },
            metadata: {
                response_time: responseTime,
                version: this.configService.get('APP_VERSION'),
            },
        });
    }
}
