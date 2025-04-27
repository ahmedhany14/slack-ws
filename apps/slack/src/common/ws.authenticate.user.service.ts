import { Inject, Injectable, Logger } from '@nestjs/common';
import { catchError, first, map, Observable } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { WsException } from '@nestjs/websockets';

import { AUTH_SERVICE } from '@app/constants';
import { SocketI } from '@app/interfaces/socket.client.interface';
import { IWsAuthenticateRequest } from '@app/auth.common';

interface AuthenticatedUser {
    id: number;
    username: string;
    anyone_dm: boolean;
}

@Injectable()
export class WsAuthenticateUserService {
    private readonly logger: Logger = new Logger(WsAuthenticateUserService.name);

    constructor(
        @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy
    ) { }

    /**
     * Authenticates a user based on the provided request
     */
    async authenticate(request: IWsAuthenticateRequest): Promise<AuthenticatedUser> {
        this.logger.log('Authenticating user for DMS connection');

        try {
            const response = await this.sendAuthenticationRequest(request);
            return this.processAuthenticationResponse(response);
        } catch (error) {
            this.handleAuthenticationError(error);
        }
    }

    /**
     * Extracts authentication token from socket connection
     */
    extractToken(socket: SocketI): string | null {
        this.logger.log('Extracting token from socket');

        const authToken = this.getTokenFromAuth(socket) || this.getTokenFromHeaders(socket);

        if (!authToken) {
            this.logger.warn('No token found in socket connection');
        }

        return authToken;
    }

    private async sendAuthenticationRequest(request: IWsAuthenticateRequest): Promise<any> {
        return this.authClient
            .send('ws-authenticate', request)
            .pipe(
                map(this.validateAuthResponse),
                catchError(this.handleAuthError),
                first()
            )
            .toPromise();
    }

    private validateAuthResponse(response: any): any {
        if (!response) {
            throw new WsException('Authentication failed: Invalid response');
        }
        return response;
    }

    private processAuthenticationResponse(response: any): AuthenticatedUser {
        if (!response) {
            throw new WsException('Authentication failed: No response data');
        }

        return {
            id: response.id,
            username: response.username,
            anyone_dm: response.anyone_dm,
        };
    }

    private handleAuthError(error: any): Observable<never> {
        this.logger.error('Authentication error:', error);
        throw new WsException('Authentication failed: Invalid credentials');
    }

    private handleAuthenticationError(error: any): never {
        this.logger.error('Authentication process failed:', error);
        throw new WsException('Authentication failed: Please try again');
    }

    private getTokenFromAuth(socket: SocketI): string | null {
        return socket.handshake?.auth?.token || null;
    }

    private getTokenFromHeaders(socket: SocketI): string | null {
        const authHeader = socket.handshake?.headers?.authorization;

        if (!authHeader) {
            return null;
        }

        const [bearer, token] = authHeader.split(' ');

        if (bearer === 'Bearer' && token) {
            return token;
        }

        return null;
    }
}