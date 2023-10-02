import IORedis from 'ioredis';

import configVars from 'config/vars';
import moment from 'moment';

const redis = new IORedis(configVars.REDIS_URL);

export const setValue = (key: string, value: Record<string, any>): void => {
  redis.set(key, JSON.stringify(value));
};

export const setValueWithExp = (
  key: string,
  value: Record<string, any>,
  expireInSec = 60
): { key: string; value: Record<string, any>; expDate: string } => {
  const expDate = moment().add(expireInSec, 'seconds');

  const expDateISO = expDate.toISOString();

  redis.set(key, JSON.stringify({ ...value, expDate: expDateISO }), 'EX', expireInSec);

  return {
    key,
    value,
    expDate: expDateISO,
  };
};

export const getValue = async <T>(key: string): Promise<T | null> => {
  const value = await redis.get(key);
  if (value) {
    return JSON.parse(value);
  }
  return null;
};

export const deleteValue = async (key: string): Promise<boolean> => {
  const res = await redis.del(key);
  return Boolean(res);
};
