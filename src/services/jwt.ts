import jwt from 'jwt-simple';

import configVars from 'config/vars';

export interface JwtPayload {
  userId: string;
  deviceId: string;
  expires: Date;
}

export const generate = (userId: string, deviceId: string, expires: Date): string => {
  const payload: JwtPayload = {
    userId,
    deviceId,
    expires,
  };

  return jwt.encode(payload, configVars.JWT_SECRET);
};

export const verify = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token, configVars.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
