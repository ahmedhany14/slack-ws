import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import { JwtPayload, TokenProvider } from '../providers/token.provider';
import { AccountService } from '../../account/account.service';

@Injectable()
export class JwtVerifyGuard implements CanActivate {
    private readonly logger = new Logger(JwtVerifyGuard.name);

    constructor(
        @Inject() private readonly tokenProvider: TokenProvider,
        @Inject() private readonly accountService: AccountService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('JwtVerifyGuard canActivate called');

        const request = context.switchToHttp().getRequest();
        const token = request.Authentication.split(' ')[1];
        if (!token)
            throw new UnauthorizedException('You are not authorized to access this resource');

        let payload: JwtPayload;
        try {
            payload = (await this.tokenProvider.verifyToken<JwtPayload>(token)) as JwtPayload;
        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.accountService.findOne({ id: payload.id });
        if (!user) throw new NotFoundException('Account not found');

        this.logger.log('user found in JwtVerifyGuard', user);
        request.user = user;
        return true;
    }
}
