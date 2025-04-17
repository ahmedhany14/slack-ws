import { Controller, Logger, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IsExistAccountGuard } from './guards/is.exist.account.guard';

@Controller('account')
export class AccountController {
    private readonly logger: Logger = new Logger(AccountController.name);

    @UseGuards(IsExistAccountGuard)
    @MessagePattern('is-exist-account')
    async isExistAccount(@Payload() payload: any): Promise<boolean> {
        this.logger.log(`account is exist, payload: `, payload);
        return true;
    }
}
