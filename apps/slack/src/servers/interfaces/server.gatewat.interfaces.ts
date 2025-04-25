import { Account } from '@app/database';

export interface ServerI {
    id: number;
    name: string;
    description: string;
    owner: Account;
    visible: boolean;
}

export interface ServerInvitation {
    server: {
        id: number;
        name: string;
        description: string;
    };
    invited_by: {
        id: number;
        name: string;
    };
}

export interface ServerMembersI {}
