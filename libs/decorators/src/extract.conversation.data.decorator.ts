import { RequestI } from '@app/interfaces';
import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';

export const ExtractConversationData = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        Logger.log(`Extracting conversation data`, 'ExtractConversationData');
        const request: RequestI = ctx.switchToHttp().getRequest();
        return data ? request.conversation?.[data] : request.conversation;
    },
);