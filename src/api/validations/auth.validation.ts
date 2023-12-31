import Joi from 'joi';

// Utils
import { generateErrorValidation, generateResponseValidation } from 'utils/Validation';
import { ErrorCode } from 'utils/APIError';

// Schemas
import { TokenSchema } from 'utils/Validation/schemas/token';
import { UserSchema } from 'utils/Validation/schemas/user';

export default {
  // POST /auth/signup
  sginup: {
    request: {
      body: Joi.object({
        email: Joi.string().email().required().description('Email'),
        password: Joi.string().min(6).max(128).required().description('Password'),
        name: Joi.string().min(3).max(128).required().description('Name'),
      }),
    },
    response: {
      ...generateResponseValidation(UserSchema.required()),
    },
  },

  // POST /auth/confirm-email
  confirmEmail: {
    request: {
      query: Joi.object({
        hash: Joi.string().required().description('Hash'),
      }),
    },
    response: {
      ...generateResponseValidation(UserSchema.required()),
    },
  },

  // POST /auth/password-recovery
  passwordRecovery: {
    request: {
      body: Joi.object({
        email: Joi.string().email().required().description('Email')
      }),
    },
    response: {
      ...generateResponseValidation(UserSchema.required()),
    },
  },

  // POST /auth/password-recovery
  updatePassword: {
    request: {
      body: Joi.object({
        password: Joi.string().min(6).max(128).required().description('Password'),
      }),
      query: Joi.object({
        hash: Joi.string().required().description('Hash'),
      }),
    },
    response: {
      ...generateResponseValidation(UserSchema.required()),
    },
  },

  // POST /auth/login
  login: {
    request: {
      body: Joi.object({
        email: Joi.string().email().required().description('Email'),
        password: Joi.string().min(6).max(128).required().description('Password'),
      }),
    },
    response: {
      ...generateResponseValidation(
        Joi.object({
          token: TokenSchema,
          profile: UserSchema,
        }),
        {
          authorization: false,
        }
      ),
    },
  },

  // POST /auth/logout
  logout: {
    response: {
      ...generateResponseValidation(Joi.string().valid('ok').required()),
      ...generateErrorValidation(ErrorCode.AUTHORIZATION_FAILED),
    },
  },

  // POST /auth/refresh-token
  refresh: {
    request: {
      body: Joi.object({
        uuid: Joi.string().min(6).max(128).required().description('Device ID'),
        refreshToken: Joi.string().required().description('Refresh token'),
      }),
    },
    response: {
      ...generateResponseValidation(
        Joi.object({
          token: TokenSchema,
          profile: UserSchema,
        }),
        {
          authorization: false,
        }
      ),
      ...generateErrorValidation(ErrorCode.REFRESH_TOKEN_NOT_FOUND),
    },
  },
};
