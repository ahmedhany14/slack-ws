import { RequestStatus } from '@app/database';

export interface MessagesResponseI {
    message: string;
}

interface InvitationSender {
    id: number;
    username: string;
}

interface Invitation {
    id: number;
    sender: InvitationSender;
    request_status: RequestStatus;
}

export interface InvitationsResponseData {
    invitations: Invitation[];
}
