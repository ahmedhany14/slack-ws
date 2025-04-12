import { Body, Controller, Logger, Post } from '@nestjs/common';

// service
import { AuthenticationService } from './authentication.service';

// dtos
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';

@Controller('authentication')
export class AuthenticationController {
    private readonly logger: Logger = new Logger(AuthenticationController.name);

    constructor(private readonly authenticationService: AuthenticationService) {}

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
}
