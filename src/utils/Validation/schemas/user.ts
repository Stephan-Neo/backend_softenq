import Joi from 'joi';

// Types
import { UserRole } from 'interfaces/user';

export const UserSchema = Joi.object({
  id: Joi.string().min(6).max(128).required().description('User ID'),
  createdAt: Joi.date().iso().description('Created At Date (ISO date)'),
  updatedAt: Joi.date().iso().description('Updated At Date (ISO date)'),
  email: Joi.string().email().required().description('Email'),
  name: Joi.string().required().description('User Name'),
  confirmEmail: Joi.boolean().description('Confirm Email'),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .description('User role'),
});
