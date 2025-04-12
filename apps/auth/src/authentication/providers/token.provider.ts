import { Inject, Injectable } from '@nestjs/common';

// JWT and Crypto
import { JwtService } from '@nestjs/jwt';

// Database
import { Account } from '@app/database';

// Interfaces
// Services
import { ConfigService } from '@app/config/config.service';

export interface JwtPayload {
    id: number;
    username: string;
}

@Injectable()
export class TokenProvider {
    constructor(
        @Inject()
        private readonly jwtService: JwtService,
        @Inject() private readonly configService: ConfigService,
    ) {}

    public async generateToken(account: Account) {
        return await this.signToken<Partial<JwtPayload>>(
            account.id,
            this.configService.authConfig?.jwtSecret || 'secret',
            this.configService.authConfig?.expiresIn || 360000,
            {
                username: account.username,
            },
        );
    }

    public async verifyToken<T>(token: string) {
        try {
            return (await this.jwtService.verifyAsync(token, {
                secret: this.configService.authConfig?.jwtSecret,
            })) as T;
        } catch (error) {}
    }

    private async signToken<T>(
        userId: number,
        secret: string,
        expiresIn: number,
        payload?: T,
    ): Promise<string> {
        return await this.jwtService.signAsync(
            // 1. Payload
            {
                id: userId,
                ...payload,
            },
            // 2. Options
            {
                secret: secret,
                expiresIn: expiresIn,
            },
        );
    }
}
