import * as Joi from 'joi';

export default Joi.object({
    NODE_ENV: Joi.string().default('development'),

    // auth app
    AUTH_HTTP_PORT: Joi.number().default(3000),
    AUTH_TCP_PORT: Joi.number().default(3001),
    AUTH_HOSTNAME: Joi.string().default('auth'),
    AUTH_JWT_SECRET: Joi.string().required(),
    AUTH_JWT_EXPIRE_IN: Joi.number().required().integer(),

    // database
    POSTGRES_HOST: Joi.string().default('localhost'),
    POSTGRES_PORT: Joi.number().default(5432),
    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DB: Joi.string().default('slack_ws_db'),
    PGADMIN_DEFAULT_EMAIL: Joi.string().required().email(),
    PGADMIN_DEFAULT_PASSWORD: Joi.string().required(),
});
