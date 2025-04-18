import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

// libraries
import { RequestI } from '@app/interfaces';

// service
import { AuthenticationService } from './authentication.service';

// dtos
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';

// guards
import { JwtVerifyGuard } from './guards/jwt.verify.guard';
import { IWsAuthenticateRequest } from '@app/auth.common';
import { WsAuthenticateGuard } from './guards/ws-authenticate.guard';

@Controller('authentication')
export class AuthenticationController {
    private readonly logger: Logger = new Logger(AuthenticationController.name);

    constructor(private readonly authenticationService: AuthenticationService) { }

    /**
     * Endpoint to register a new user
     * @param signupDto 
     * @returns token and user data 
     */
    @Post('signup')
    async register(@Body() signupDto: SignupDto) {
        this.logger.log(`new signupDto: ${signupDto}`);

        return this.authenticationService.register(signupDto);
    }

    @Post('sign-in')
    async login(@Body() loginDto: LoginDto) {
        this.logger.log(`new loginDto: ${loginDto}`);

        return this.authenticationService.login(loginDto);
    }

    @UseGuards(JwtVerifyGuard)
    @MessagePattern('authenticate')
    async authenticate(@Payload() payload: RequestI) {
        this.logger.log(`user authenticated, payload: `, payload);
        return payload.user;
    }

    @UseGuards(WsAuthenticateGuard)
    @MessagePattern('ws-authenticate')
    async WsAuthenticate(@Payload() payload: IWsAuthenticateRequest) {
        this.logger.log(`user authenticated, payload: `, payload.user);
        return payload.user;
    }

}
