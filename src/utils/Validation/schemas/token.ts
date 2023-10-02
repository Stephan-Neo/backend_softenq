import Joi from 'joi';

export const TokenSchema = Joi.object({
  accessToken: Joi.string().required().description('Authorization Token'),
  refreshToken: Joi.string().required().description('Token to get a new accessToken after expiration time'),
  expiresIn: Joi.number().integer().required().description("Access Token's expiration time in milliseconds"),
}).description('User token information');
