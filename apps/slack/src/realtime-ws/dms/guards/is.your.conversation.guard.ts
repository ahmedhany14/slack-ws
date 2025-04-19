import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DmsService } from '../services/dms.service';
import { RequestI } from '@app/interfaces';

@Injectable()
export class IsYourConversationGuard implements CanActivate {

    constructor(
        @Inject() private readonly dmsService: DmsService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request: RequestI = context.switchToHttp().getRequest();

        const conversation_id = +request.params.conversation_id, user_id = request.user.id;

        const conversation = await this.dmsService.findOne({
            id: conversation_id,
            conversation_initiator: { id: user_id }
        }) || await this.dmsService.findOne({
            id: conversation_id,
            conversation_recipient: { id: user_id }
        });

        if (!conversation) {
            throw new UnauthorizedException({
                message: "You are not authorized to access this conversation or it does not exist"
            })
        }
        request.conversation = conversation;
        return true;
    }
}
