import { NextFunction, Request, Response } from 'express';
import { RequestValidationError } from 'express-joi-openapi';

// Services
import logger from 'services/logger';

// Utils
import APIError, { ErrorCode } from 'utils/APIError';
import configVars from 'config/vars';
import { endTimer, MetaData } from '../utils/ApiUtils';

// Configs

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
export const handler = (
  err: APIError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const meta: MetaData = {};

  // add Timer data
  const timer = endTimer({ req });
  if (timer) {
    meta.timer = timer.last;
    meta.timerAvg = timer.avg;
  }

  const response = {
    error: {
      code: err.code,
      message: err.message || err.status,
      fieldErrors: err.fieldErrors,
      stack: err.stack,
    },
    meta,
  };

  if (!['development', 'test'].includes(configVars.env)) {
    delete response.error.stack;
  }

  logger.warn('RESPONSE WITH ERROR:', JSON.stringify(response));

  res.status(err.status);
  res.json(response);
};

export const errorHandler = (error: RequestValidationError | APIError | Error): APIError => {
  let convertedError = error;

  if (error instanceof RequestValidationError) {
    convertedError = new APIError(ErrorCode.VALIDATION_ERROR, {
      fieldErrors: {
        [error.segment]: error.validationError.details,
      },
    });
  } else if (!(error instanceof APIError)) {
    convertedError = new APIError(ErrorCode.INTERNAL_SERVER_ERROR, {
      message: error.message,
      stack: error.stack,
    });
  }

  return convertedError as APIError;
};

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
export const converter = (
  err: RequestValidationError | APIError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  return handler(errorHandler(err), req, res, next);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const err = new APIError(ErrorCode.NOT_FOUND);

  return handler(err, req, res, next);
};
