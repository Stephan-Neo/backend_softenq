import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

// Services
import logger from 'services/logger';

// Utils
import mstime from 'utils/MSTime';

// Configs
import configVars from 'config/vars';

export interface MSTimer {
  last: number;
  avg: number;
}

export interface MetaData {
  timer?: number;
  timerAvg?: number;
}

export interface ResponseData<Data> {
  data: Data;
  meta: MetaData;
}

// get url path only - remove query string (after "?"):
const getUrlPathOnly = (fullUrl: string): string => `${fullUrl}?`.slice(0, fullUrl.indexOf('?'));

export function startTimer({ key, req }: { key?: string; req?: Request }): void {
  let timerKey = key;

  if (!key && req) {
    timerKey = getUrlPathOnly(req.originalUrl);
  }

  if (!timerKey) {
    return;
  }

  mstime.start(timerKey, { uuid: uuid() });
}

export function endTimer({ key, req }: { key?: string; req?: Request }): MSTimer | null {
  let timerKey = key;

  if (!key && req) {
    timerKey = getUrlPathOnly(req.originalUrl);
  }

  if (!timerKey) {
    return null;
  }

  const end = mstime.end(timerKey) as MSTimer;

  if (end) {
    if (configVars.env === 'development') {
      logger.debug(`- mstime: avg time - ${end.avg} (ms)`);
      // console.log('--- mstime: ', mstime);
    }
    return end;
  }

  return null;
}

/**
 * prepare a standard API Response, e.g. { meta: {...}, data: [...], errors: [...] }
 * @param param0
 */
export function apiJson<Result>({ req, res, data }: { req: Request; res: Response; data: Result }): Response<Result> {
  const meta: MetaData = {};

  // add Timer data
  const timer = endTimer({ req });
  if (timer) {
    meta.timer = timer.last;
    meta.timerAvg = timer.avg;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output: ResponseData<any> = {
    data,
    meta,
  };

  logger.debug('RESPONSE:', JSON.stringify(output));

  return res.json(output);
}
