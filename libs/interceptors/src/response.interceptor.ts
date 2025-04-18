import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ResponseInterceptor.name);

    constructor(private configService: ConfigService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();

        return next.handle().pipe(
            map((data) => {
                const response = context.switchToHttp().getResponse<Response>();
                const statusCode = response.statusCode;
                const responseTime = `${Date.now() - start}ms`;

                const res = data.response;

                return {
                    status: 'success',
                    code: statusCode,
                    data: typeof res !== 'undefined' ? res : null,
                    error: null,
                    meta: {
                        total_rows: data?.meta?.total ?? 0,
                        total_pages: data?.meta?.totalPages ?? 0,
                        page: data?.meta?.page ?? 0,
                        limit: data?.meta?.limit ?? 0,
                        hasMore: data?.meta?.hasMore ?? null,
                        first_page: data?.meta?.firstPage ?? null,
                        last_page: data?.meta?.lastPage ?? null,
                        previous_page: data?.meta?.previous ?? null,
                        next_page: data?.meta?.next ?? null,
                        current_page: data?.meta?.current ?? null,
                    },
                    metadata: {
                        responseTime,
                        version: this.configService.get('APP_VERSION'),
                    },
                };
            }),
        );
    }
}
