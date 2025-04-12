export interface authAppConfig {
    httpPort: number;
    tcpPort: number;
    hostname: string;
    env: string;
}

export interface authConfig {
    jwtSecret: string;
}

export interface Config {
    authApp: authAppConfig;
    authConfig: authConfig;
}