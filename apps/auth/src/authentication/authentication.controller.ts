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

    constructor(private readonly authenticationService: AuthenticationService) {}

    /**
     * Handles the user sign-up process by creating a new account using the provided sign-up information.
     *
     * @param {SignupDto} signupDto - The data transfer object containing the user's sign-up information such as email, password, and other necessary details.
     * @return {Promise<{ user: { id: number; username: string }; token: string }>} A promise that resolves with the created user's information and an authentication token.
     */
    @Post('signup')
    async register(@Body() signupDto: SignupDto): Promise<{
        user: {
            id: number;
            username: string;
        };
        token: string;
    }> {
        this.logger.log(`new sign up attempted}`);

        return this.authenticationService.register(signupDto);
    }

    /**
     * Handles user login by validating credentials and providing authentication tokens.
     *
     * @param {LoginDto} loginDto - Data Transfer Object containing user login information such as username and password.
     * @return {Promise<{ user: { id: number; username: string }; token: string }>} A promise that resolves with the user's information and an authentication token.
     */
    @Post('sign-in')
    async login(@Body() loginDto: LoginDto): Promise<{
        user: {
            id: number;
            username: string;
        };
        token: string;
    }> {
        this.logger.log(`user login attempted, email: ${loginDto.username}`);

        return this.authenticationService.login(loginDto);
    }

    /**
     * Authenticates a user based on the provided payload and logs the authentication event.
     *
     * @param {RequestI} payload - The payload containing the user's authentication details.
     * @return {any} Returns the authenticated user's information.
     */
    @UseGuards(JwtVerifyGuard)
    @MessagePattern('authenticate')
    async authenticate(@Payload() payload: RequestI): Promise<any> {
        this.logger.log(`user authenticated`);
        return payload.user;
    }

    /**
     * Handles WebSocket authentication requests and logs the authenticated user's details.
     *
     * @param {IWsAuthenticateRequest} payload - The payload of the WebSocket authentication request, containing user details.
     * @return {Promise<any>} Returns the authenticated user's data.
     */
    @UseGuards(WsAuthenticateGuard)
    @MessagePattern('ws-authenticate')
    async WsAuthenticate(@Payload() payload: IWsAuthenticateRequest): Promise<
        | {
              id: number;
              username: string;
          }
        | null
        | undefined
    > {
        this.logger.log(`user authenticated, payload: `, payload.user);
        return payload.user;
    }
}
