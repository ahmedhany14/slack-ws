import { Request } from 'express';
import { Server } from '@app/database';

export interface RequestI extends Request {
    user: {
        id: number;
        username: string;
    };

    server: Server;
}
