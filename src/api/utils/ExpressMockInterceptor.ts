import { Request, Response, NextFunction } from 'express';

import { RequestContext } from 'api/types/request-context';

const DEFAULT_ORIGINAL_URL = 'DEFAULT_ORIGINAL_URL';

export const mockRequest = (
  {
    body = {},
    params = {},
    query = {},
  }: {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    body?: { [key: string]: any };
    params?: { [key: string]: any };
    query?: { [key: string]: any };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  },
  context: RequestContext = {
    user: null,
    device: null,
    isAdmin: false,
  },
  originalUrl: string = DEFAULT_ORIGINAL_URL
): Request => {
  return {
    body,
    params,
    query,
    context,
    originalUrl,
  } as unknown as Request;
};

export const mockResponse = (): Response => {
  return {
    send: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
  } as Response & {
    send: jest.Mock;
    status: jest.Mock;
    json: jest.Mock;
  };
};

export const mockNext = (): NextFunction & jest.Mock => jest.fn();
