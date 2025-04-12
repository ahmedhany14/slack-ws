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
});
