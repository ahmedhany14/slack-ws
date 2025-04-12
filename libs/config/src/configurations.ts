import { Config } from './config.interface';

export default (): Config => ({
    authApp: {
        hostname: process.env.HOSTNAME || 'auth',
        env: process.env.NODE_ENV || 'development',
        httpPort: parseInt(process.env.HTTP_PORT || '3000', 10),
        tcpPort: parseInt(process.env.TCP_PORT || '3001', 10),
    },
    authConfig: {
        jwtSecret: process.env.JWT_SECRET || '',
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
});
