import { Request } from 'express';

export interface RequestI extends Request {
    user: {
        id: number;
        username: string;
    };

}
