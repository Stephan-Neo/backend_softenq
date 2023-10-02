import express from 'express';

// Middlewares

// Utils
import { validate } from 'utils/Validation';

// Types
import { UserRole } from 'interfaces/user';

import * as controller from 'api/controllers/auth.controller';
import validation from 'api/validations/auth.validation';

const router = express.Router();

router.route('/login').post(validate(validation.login), controller.login);

router.route('/refresh-token').post(validate(validation.refresh), controller.refresh);

export default router;
