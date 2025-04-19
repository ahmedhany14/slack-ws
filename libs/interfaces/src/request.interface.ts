import { DirectConversation, Server } from '@app/database';
import { Request } from 'express';

export interface RequestI extends Request {
    user: {
        id: number;
        username: string;
    };
    conversation?: DirectConversation;
    server?: Server
}
