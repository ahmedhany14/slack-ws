export interface IWsAuthenticateRequest {
    token: string | null;
    user?: {
        id: number;
        username: string;
    } | null;
}
