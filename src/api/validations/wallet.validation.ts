import Joi from 'joi';

// Utils
import { generateResponseValidation } from 'utils/Validation';

// Schemas
import { WalletSchema } from '../../utils/Validation/schemas/wallet';

export default {
  // POST /wallet/add
  addWallet: {
    request: {
      body: Joi.object({
        userId: Joi.string().required().description('User Id'),
        address: Joi.string().required().description('Address'),
      }),
    },
    response: {
      ...generateResponseValidation(WalletSchema.required()),
    },
  },

  // GET /wallet/get
  getWallet: {
    request: {
      query: Joi.object({
        userId: Joi.string().required().description('User Id'),
      }),
    },
    response: {
      ...generateResponseValidation(WalletSchema.required()),
    },
  },
};
