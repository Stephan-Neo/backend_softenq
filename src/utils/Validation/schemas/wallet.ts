import Joi from 'joi';

export const WalletSchema = Joi.object({
  id: Joi.string().min(6).max(128).required().description('Wallet Id'),
  userId: Joi.string().required().description('User Id'),
  address: Joi.string().required().description('Address'),
  createdAt: Joi.date().iso().description('Created At Date (ISO date)'),
  updatedAt: Joi.date().iso().description('Updated At Date (ISO date)'),
});
