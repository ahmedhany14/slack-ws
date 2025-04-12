import { Config } from './config.interface';

export default (): Config => ({
    authApp: {
        hostname: process.env.AUTH_HOSTNAME || 'auth',
        env: process.env.NODE_ENV || 'development',
        httpPort: parseInt(process.env.AUTH_HTTP_PORT || '3000', 10),
        tcpPort: parseInt(process.env.AUTH_TCP_PORT || '3001', 10),
    },
    authConfig: {
        jwtSecret: process.env.AUTH_JWT_SECRET || '',
        expiresIn: parseInt(process.env.AUTH_JWT_EXPIRE_IN || '36000', 10),
    },
    dbConfig: {
        type: process.env.POSTGRES_TYPE || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        username: process.env.POSTGRES_USER || '',
        password: process.env.POSTGRES_PASSWORD || '',
        database: process.env.POSTGRES_DB || 'slack_ws_db',
        synchronize: process.env.DB_SYNC === 'true' || false,
    },
    slackConfig:{
        hostname: process.env.SLACK_HOSTNAME || 'slack',
        httpPort: parseInt(process.env.SLACK_HTTP_PORT || '8082', 10),
        tcpPort: parseInt(process.env.SLACK_TCP_PORT || '8083', 10),
    }
});
