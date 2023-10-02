import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

// Config
import configVars from 'config/vars';

// Utils
import { generateSpecification } from 'utils/Validation';

import authRoutes from './auth.route';

const router = Router();

router.use('/auth', authRoutes);

const swaggerSpecification = generateSpecification(router);

if (configVars.SWAGGER_ENABLED) {
  router.use('/docs/swagger.json', (req, res) => res.json(swaggerSpecification));
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecification));
  router.use('/ws-client', express.static('ws-client'));
}

export default router;
