import { Body, Controller, Get, Inject, Patch, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { ExtractUserData } from '@app/decorators';
import { UpdateAccountDto } from './dtos/update.account.dto';
import { AuthGuard } from '@app/auth.common';

@UseGuards(AuthGuard)
@Controller('account')
export class AccountController {

    constructor(
        @Inject()
        private readonly accountService: AccountService
    ) { }

    /**
     * Get the account information of the user
     * 
     * @param id The id of the user
     * @returns An object containing the account information
     */
    @Get()
    async getAccount(
        @ExtractUserData('id') id: number
    ) {
        return {
            response: await this.accountService.findOne({ id }),
        }
    }


    /**
     * Update the account information of the user
     * 
     * @param id The id of the user
     * @param updateAccountDto The account information to update
     * @returns An object containing the updated account information
     */
    @Patch('privacy')
    async updatePrivacy(
        @ExtractUserData('id') id: number,
        @Body() updateAccountDto: UpdateAccountDto
    ) {
        const account = await this.accountService.findOneAndUpdate({
            id
        }, {
            anyone_dm: updateAccountDto.anyone_dm
        })

        return {
            response: account
        }
    }

}
