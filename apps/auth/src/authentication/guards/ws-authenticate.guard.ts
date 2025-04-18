import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger, NotFoundException, UnauthorizedException,
} from '@nestjs/common';

import { JwtPayload, TokenProvider } from '../providers/token.provider';
import { AccountService } from '../../account/account.service';
import { IWsAuthenticateRequest } from '@app/auth.common';

@Injectable()
export class WsAuthenticateGuard implements CanActivate {
    private readonly logger = new Logger(WsAuthenticateGuard.name);

    constructor(
        @Inject() private readonly tokenProvider: TokenProvider,
        @Inject() private readonly accountService: AccountService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log(`web socket authentication guard called`);
        const request: IWsAuthenticateRequest = context.switchToWs().getClient();
        const token = request.token;

        if (!token) {
            this.logger.error('No token provided');
            return false;
        }

        let payload: JwtPayload;
        try {
            payload = (await this.tokenProvider.verifyToken<JwtPayload>(token)) as JwtPayload;
        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }
        if (!payload) {
            this.logger.error('Invalid token');
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.accountService.findOne({ id: payload.id });
        if (!user) throw new NotFoundException('Account not found');

        this.logger.log('user found in JwtVerifyGuard');
        request.user = user;
        return true;
    }
}
