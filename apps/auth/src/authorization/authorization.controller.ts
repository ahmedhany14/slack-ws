import { Controller, Logger, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestI } from '@app/interfaces';

@Controller('authorization')
export class AuthorizationController {
    private readonly logger: Logger = new Logger(AuthorizationController.name);

    // /**
    //  * Handles the authorization check to determine if a user is allowed to update.
    //  *
    //  * @param {RequestI} payload - The incoming request payload containing relevant data for the authorization check.
    //  * @return {Promise<RequestI>} A promise resolving to the same request payload if the user is authorized to update.
    //  */
    // @UseGuards(AllowToUpdateGuard)
    // @MessagePattern('authorized-to-update')
    // async allowedToUpdate(@Payload() payload: RequestI): Promise<RequestI> {
    //     this.logger.log(`user authorized to update server, payload: `, payload);
    //     return payload;
    // }
}
