export interface authAppConfig {
    httpPort: number;
    tcpPort: number;
    hostname: string;
    env: string;
}

export interface authConfig {
    jwtSecret: string;
    expiresIn: number;
}


export interface dbConfig {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
}

export interface slackConfig {
    hostname: string;
    httpPort: number;
    tcpPort: number;
}

export interface Config {
    authApp: authAppConfig;
    authConfig: authConfig;
    dbConfig: dbConfig;
    slackConfig: slackConfig;
}