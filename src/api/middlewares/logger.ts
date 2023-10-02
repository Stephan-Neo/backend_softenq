import { NextFunction, Request, Response } from 'express';

// Services
import logger from 'services/logger';

export default (req: Request, res: Response, next: NextFunction): void => {
  logger.debug(
    'REQUEST:',
    req.method,
    `${req.url},`,
    'IP:',
    `${req.headers['x-real-ip'] || req.connection.remoteAddress},`,
    'Forwarded IP:',
    `${req.headers['x-forwarded-for'] || req.connection.remoteAddress},`,
    'User Agent:',
    `${req.headers['user-agent']},`,
    'Token:',
    `${req.headers['x-auth-token']},`,
    'Accept version:',
    `${req.headers['accept-version']},`,
    'Params:',
    `${JSON.stringify(req.params)},`,
    'Body:',
    `${JSON.stringify(req.body)},`,
    'Query:',
    JSON.stringify(req.query)
  );

  next();
};
