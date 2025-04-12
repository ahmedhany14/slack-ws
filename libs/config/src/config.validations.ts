import * as Joi from 'joi';

export default Joi.object({
    HTTP_PORT: Joi.number().default(3000),
    TCP_PORT: Joi.number().default(3001),
    HOSTNAME: Joi.string().default('auth'),
    NODE_ENV: Joi.string().default('development'),
    JWT_SECRET: Joi.string().required(),
});
