import { ValidationErrorItem } from 'joi';
import httpStatus from 'http-status';
import { RequestSegment } from 'express-joi-openapi';

// Services
import logger from 'services/logger';

// Utils
import { generateMessage } from 'utils/MessageGenerator';

// Configs
import configVars from 'config/vars';

export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  USER_IS_NOT_ADMIN = 'USER_IS_NOT_ADMIN',
  OUT_OF_DATE = 'OUT_OF_DATE',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONDITION_FAILED = 'CONDITION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  INCORRECT_EMAIL = 'INCORRECT_EMAIL',
  INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_NOT_AVAILABLE = 'DATABASE_NOT_AVAILABLE',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  INTERNAL_WARNING = 'INTERNAL_WARNING',
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
}

export const errorsMap: {
  [errorName in ErrorCode]: {
    code: string;
    message: string;
  };
} = {
  [ErrorCode.UNKNOWN_ERROR]: {
    code: '0000',
    message: 'Unknown error',
  },
  [ErrorCode.BAD_REQUEST]: {
    code: '1000',
    message: 'Bad Request',
  },
  [ErrorCode.VALIDATION_ERROR]: {
    code: '1001',
    message: 'Validation Error',
  },
  [ErrorCode.USER_IS_NOT_ADMIN]: {
    code: '1120',
    message: 'The user is not an administrator',
  },
  [ErrorCode.OUT_OF_DATE]: {
    code: '1200',
    message: 'Out of date',
  },
  [ErrorCode.ALREADY_EXISTS]: {
    code: '1211',
    message: 'Already exists',
  },
  [ErrorCode.CONDITION_FAILED]: {
    code: '1300',
    message: 'Condition failed',
  },
  [ErrorCode.UNAUTHORIZED]: {
    code: '1400',
    message: 'Unauthorized',
  },
  [ErrorCode.AUTHORIZATION_FAILED]: {
    code: '1401',
    message: 'Authorization failed',
  },
  [ErrorCode.INCORRECT_EMAIL]: {
    code: '1401',
    message: 'incorrect email',
  },
  [ErrorCode.INCORRECT_PASSWORD]: {
    code: '1401',
    message: 'incorrect password',
  },
  [ErrorCode.PAYMENT_REQUIRED]: {
    code: '1500',
    message: 'Payment Required',
  },
  [ErrorCode.FORBIDDEN]: {
    code: '1600',
    message: 'Forbidden',
  },
  [ErrorCode.NOT_FOUND]: {
    code: '1700',
    message: 'Not Found',
  },
  [ErrorCode.METHOD_NOT_ALLOWED]: {
    code: '1800',
    message: 'Method Not Allowed',
  },
  [ErrorCode.REQUEST_TIMEOUT]: {
    code: '1900',
    message: 'Request Timeout ',
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    code: '2000',
    message: 'Internal Server Error',
  },
  [ErrorCode.DATABASE_NOT_AVAILABLE]: {
    code: '2001',
    message: 'Database not available',
  },
  [ErrorCode.NOT_IMPLEMENTED]: {
    code: '2100',
    message: 'Not Implemented',
  },
  [ErrorCode.BAD_GATEWAY]: {
    code: '2200',
    message: 'Bad Gateway',
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    code: '2300',
    message: 'Service Unavailable',
  },
  [ErrorCode.GATEWAY_TIMEOUT]: {
    code: '2400',
    message: 'Gateway Timeout',
  },
  [ErrorCode.INTERNAL_WARNING]: {
    code: '3000',
    message: 'Internal Warning',
  },
  [ErrorCode.REFRESH_TOKEN_NOT_FOUND]: {
    code: '1701',
    message: 'Refresh token not found',
  },
};

const httpCodesMap: { [key: string]: number } = {
  '00': httpStatus.INTERNAL_SERVER_ERROR,
  '10': httpStatus.BAD_REQUEST,
  '11': httpStatus.BAD_REQUEST,
  '12': httpStatus.BAD_REQUEST,
  '13': httpStatus.BAD_REQUEST,
  '14': httpStatus.UNAUTHORIZED,
  '15': httpStatus.PAYMENT_REQUIRED,
  '16': httpStatus.FORBIDDEN,
  '17': httpStatus.NOT_FOUND,
  '18': httpStatus.METHOD_NOT_ALLOWED,
  '19': httpStatus.REQUEST_TIMEOUT,
  '20': httpStatus.INTERNAL_SERVER_ERROR,
  '21': httpStatus.NOT_IMPLEMENTED,
  '22': httpStatus.BAD_GATEWAY,
  '23': httpStatus.SERVICE_UNAVAILABLE,
  '24': httpStatus.GATEWAY_TIMEOUT,
  '30': httpStatus.INTERNAL_SERVER_ERROR,
};

export const getHttpStatusByCode = (errorCode: string): number => {
  const firstChars = (errorCode ? errorCode.toString() : '0000').substr(0, 2);

  return httpCodesMap[firstChars] || httpCodesMap['00'];
};

/**
 * @extends Error
 */
class ExtendableError extends Error {
  code: string;
  status: number;
  isOperational: boolean;
  fieldErrors?: { [segment in RequestSegment]?: ValidationErrorItem[] };

  constructor({
    code,
    message,
    fieldErrors,
    status,
    stack,
  }: {
    code: string;
    message: string;
    fieldErrors?: { [segment in RequestSegment]?: ValidationErrorItem[] };
    status: number;
    stack?: string;
  }) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.message = message;
    this.fieldErrors = fieldErrors;
    this.status = status;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    this.stack = stack;

    if (configVars.env === 'development') {
      // Error.captureStackTrace(this, this.constructor.name);
      logger.error(stack || message);
    }
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  constructor(
    errorName: ErrorCode,
    {
      message,
      fieldErrors,
      stack,
      replacements,
    }: {
      message?: string;
      fieldErrors?: { [segment in RequestSegment]?: ValidationErrorItem[] };
      stack?: string;
      replacements?: { [key: string]: string | number };
    } = {}
  ) {
    const code = errorsMap[errorName] ? errorsMap[errorName].code : '0000';

    super({
      code,
      message: generateMessage(message || errorsMap[errorName].message, replacements),
      status: getHttpStatusByCode(code),
      fieldErrors,
      stack,
    });
  }
}

export default APIError;
