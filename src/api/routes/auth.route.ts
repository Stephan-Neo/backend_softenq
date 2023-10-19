import express from 'express';

// Middlewares

// Utils
import { validate } from 'utils/Validation';

// Types

import * as controller from 'api/controllers/auth.controller';
import validation from 'api/validations/auth.validation';

const router = express.Router();

router.route('/signup').post(validate(validation.sginup), controller.registration);

router.route('/confirm-email').post(validate(validation.confirmEmail), controller.confirmEmail);

router.route('/password-recovery').post(validate(validation.passwordRecovery), controller.passwordRecovery);

router.route('/update-password').post(validate(validation.updatePassword), controller.updatePassword);

router.route('/login').post(validate(validation.login), controller.login);

router.route('/refresh-token').post(validate(validation.refresh), controller.refresh);

export default router;
