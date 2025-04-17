import { Controller, Logger, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestI } from '@app/interfaces';
import { AllowToUpdateGuard } from './guards/allow.to.update.guard';

@Controller('authorization')
export class AuthorizationController {
    private readonly logger: Logger = new Logger(AuthorizationController.name);

    @UseGuards(AllowToUpdateGuard)
    @MessagePattern('authorized-to-update')
    async allowedToUpdate(@Payload() payload: RequestI): Promise<RequestI> {
        this.logger.log(`user authorized to update server, payload: `, payload);
        return payload;
    }
}
