import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestI } from '@app/interfaces';
import { AllowToUpdateGuard } from './guards/allow.to.update.guard';

@Controller('authorization')
export class AuthorizationController {
    @UseGuards(AllowToUpdateGuard)
    @MessagePattern('authorized-to-update')
    async allowedToUpdate(@Payload() payload: RequestI): Promise<RequestI> {
        return payload;
    }
}
