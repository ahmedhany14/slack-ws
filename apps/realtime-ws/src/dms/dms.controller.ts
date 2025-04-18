import { AuthGuard } from '@app/auth.common';
import { ExtractUserData } from '@app/decorators';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DmsService } from './dms.service';

@UseGuards(AuthGuard)
@Controller('dms')
export class DmsController {

    constructor(
        private readonly dmsService: DmsService
    ) { }

    @Get()
    async getMyConversations(
        @ExtractUserData('id') id: number
    ) {
        return await this.dmsService.findAllMyDms(id);
    }
}
