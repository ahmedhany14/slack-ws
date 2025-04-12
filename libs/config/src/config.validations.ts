import * as Joi from 'joi';

export default Joi.object({
    // auth app
    HTTP_PORT: Joi.number().default(3000),
    TCP_PORT: Joi.number().default(3001),
    HOSTNAME: Joi.string().default('auth'),
    NODE_ENV: Joi.string().default('development'),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRE_IN: Joi.number().required().integer(),

    // database
    POSTGRES_HOST: Joi.string().default('localhost'),
    POSTGRES_PORT: Joi.number().default(5432),
    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),
    POSTGRES_DB: Joi.string().default('slack_ws_db'),
    PGADMIN_DEFAULT_EMAIL: Joi.string().required().email(),
    PGADMIN_DEFAULT_PASSWORD: Joi.string().required(),
});
