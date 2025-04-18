import { Controller, Logger, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IsExistAccountGuard } from './guards/is.exist.account.guard';
import { IsExistReceiverGuard } from '@app/auth.common/guards/is.exist.receiver.guard';

@Controller('account')
export class AccountController {
    private readonly logger: Logger = new Logger(AccountController.name);

    // TODO: resolve type problems, remove any in the future and create a interface
    /**
     * Message pattern to check if the account exists
     * @param payload
     * @returns boolean
     */
    @UseGuards(IsExistAccountGuard)
    @MessagePattern('is-exist-account')
    async isExistAccount(@Payload() payload: IsExistReceiverGuard): Promise<boolean> {
        this.logger.log(`account is exist, payload: `, payload);
        return true;
    }
}
