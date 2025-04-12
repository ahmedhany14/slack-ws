import { ConflictException, Injectable } from '@nestjs/common';
import { BcryptProvider } from './providers/bcrypt.provider';
import { SignupDto } from './dtos/signup.dto';
import { AccountService } from '../account/account.service';
import { Account } from '@app/database';

@Injectable()
export class AuthenticationService {

    constructor(
        private readonly bcryptProvider: BcryptProvider,
        private readonly accountService: AccountService,
    ) {
    }



    async login() {
    }

    async register(
        signupDto: SignupDto
    ) {
        // hash password
        const hashedPassword = await this.bcryptProvider.hash(signupDto.password);
        // check if user exists
        if (await this.accountService.findOne({ username: signupDto.username }))
            throw new ConflictException('username used before, try another one')

        // save user to database

        const user = await this.accountService.create({
            password: hashedPassword,
            username: signupDto.username
        } as Account)

        // generate JWT token
        const token = "ssadasdas" // hard coded now will be implemented later

        // return user and token

        return {
            user,
            token
        }
    }

}
