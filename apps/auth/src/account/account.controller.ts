import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IsExistAccountGuard } from './guards/is.exist.account.guard';

@Controller('account')
export class AccountController {


    @UseGuards(IsExistAccountGuard)
    @MessagePattern('is-exist-account')
    async isExistAccount(
        @Payload() payload: any,
    ): Promise<boolean> {

        console.log('payload', payload);

        return true;
    }
}
