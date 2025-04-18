export interface JwtRequestGuardInterface {
    Authentication: string;
    user?: {
        id: number;
        username: string;
    };
}
