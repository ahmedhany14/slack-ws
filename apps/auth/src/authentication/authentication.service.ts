import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { Account } from '@app/database';

// service
import { TokenProvider } from './providers/token.provider';
import { AccountService } from '../account/account.service';
import { BcryptProvider } from './providers/bcrypt.provider';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly bcryptProvider: BcryptProvider,
        private readonly accountService: AccountService,
        private readonly tokenProvider: TokenProvider,
    ) {}

    async login(loginDto: LoginDto) {
        const user = await this.accountService.findWithSensitiveData(loginDto.username);
        if (!user) throw new ConflictException('username not found');

        const isPasswordValid = await this.bcryptProvider.compare(loginDto.password, user.password);
        if (!isPasswordValid) throw new ConflictException('password not valid');

        const token = await this.tokenProvider.generateToken(user);

        return {
            user: {
                id: user.id,
                username: user.username,
            },
            token,
        };
    }

    // DONE: allow only this function and login to access password and at the end remove them
    async register(signupDto: SignupDto) {
        // hash password
        const hashedPassword = await this.bcryptProvider.hash(signupDto.password);
        // check if a user exists
        if (await this.accountService.findOne({ username: signupDto.username }))
            throw new ConflictException('username used before, try another one');

        // save user to a database

        const user = await this.accountService.create({
            password: hashedPassword,
            username: signupDto.username,
        } as Account);

        // generate JWT token
        const token = await this.tokenProvider.generateToken(user);

        // return user and token

        return {
            user : {
                id: user.id,
                username: user.username,
            },
            token,
        };
    }
}
