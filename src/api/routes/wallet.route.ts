import express from 'express';

// Middlewares

// Utils
import { validate } from 'utils/Validation';

// Types

import * as controller from 'api/controllers/wallet.controller';
import validation from 'api/validations/wallet.validation';

const router = express.Router();

router.route('/add').post(validate(validation.addWallet), controller.addWallet);

router.route('/get').get(validate(validation.getWallet), controller.getWallet);


export default router;
