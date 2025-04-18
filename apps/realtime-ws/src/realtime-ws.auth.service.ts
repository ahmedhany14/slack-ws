import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { catchError, first, map, tap } from 'rxjs';

import { AUTH_SERVICE } from '@app/constants';
import { ClientProxy } from '@nestjs/microservices';
import { WsException } from '@nestjs/websockets';
import { SocketI } from './interfaces/socket.client.interface';
import { IWsAuthenticateRequest } from '@app/auth.common';

@Injectable()
export class RealtimeWsAuthService {
    private readonly logger: Logger = new Logger(RealtimeWsAuthService.name);

    constructor(
        @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    ) { }
    
    async authenticate(request: IWsAuthenticateRequest): Promise<{ id: number; username: string }> {
        this.logger.log('authenticate user to connect to dms');
        try {
            const response = await this.authClient
                .send('ws-authenticate', request)
                .pipe(
                    map((response) => {
                        if (response) {
                            console.log('user authenticated');
                            return response;
                        } else {
                            throw new WsException('You are not authorized to access this resource');
                        }
                    }),
                    catchError((error) => {
                        this.logger.error('Error authenticating user', error);
                        throw new WsException('You are not authorized to access this resource');
                    }),
                    first(),
                )
                .toPromise();

            if (!response) {
                throw new WsException('You are not authorized to access this resource');
            }

            return {
                id: response.id,
                username: response.username,
            };
        } catch (error) {
            this.logger.log('Error authenticating user');
            throw new WsException('You are not authorized to access this resource');
        }
    }

    extractToken(socket: SocketI): string | null {
        const tokenFromAuth = socket.handshake?.auth?.token;
        if (tokenFromAuth) return tokenFromAuth;
        const tokenFromHeaders = socket.handshake?.headers?.authorization;
        if (tokenFromHeaders) {
            const [bearer, token] = tokenFromHeaders.split(' ');
            if (bearer === 'Bearer' && token) {
                return token;
            }
        }
        return null;
    }

}
