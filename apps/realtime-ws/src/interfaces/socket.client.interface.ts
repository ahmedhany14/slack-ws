import { JwtPayload } from './jwt.interface';
import { Socket } from 'socket.io';

export interface SocketI extends Socket {
    data: {
        payload?: JwtPayload;
        user?: {
            id: number;
            username: string;
        };
    };
}
