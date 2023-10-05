import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Utils
import APIError, { ErrorCode } from 'utils/APIError';
import { apiJson, startTimer } from 'api/utils/ApiUtils';

// Models
import { IUser, IUserTransformType, User } from 'models/user.model';
import { Device } from 'models/device.model';
import { RefreshToken } from 'models/refresh-token.model';
import { UserRole } from 'interfaces/user';

interface AuthorizationResponse {
  profile: IUser;
  token: {
    accessToken: string;
    refreshToken: string;
    expiresIn: Date;
  };
}

/**
 * Returns a formatted object with tokens
 * @private
 */
const generateAuthorizationResponse = async (user: User, deviceId: string): Promise<AuthorizationResponse> => {
  const [device, refreshTokenRecord] = await Promise.all([
    Device.generateAccessToken(user.id, deviceId),
    RefreshToken.generate(user.id, deviceId),
  ]);

  return {
    profile: user.transform(IUserTransformType.private),
    token: {
      accessToken: device.accessToken,
      refreshToken: refreshTokenRecord.token,
      expiresIn: device.accessTokenExpires,
    },
  };
};

/**
 * SignUp user
 * @public
 */
export async function registration(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    startTimer({ req });
    const role = UserRole.USER
    const {
      email,
      password,
      name,
      phone
    } = req.body as {
      email: string;
      password: string;
      name: string;
      phone: string;
    };

    const user = await User.create({
      email,
      name,
      password,
      role,
      phone
    });

    return apiJson({
      req,
      res,
      data: user!.transform(IUserTransformType.private),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns jwt token, refresh token and profile if login was successful
 * @public
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    startTimer({ req });
    const {
      email,
      password,
    } = req.body as {
      email: string;
      password: string;
    };

    const deviceId = uuidv4()
    const user = await User.findUserByEmail(email);

    if (!user) {
      return next(new APIError(ErrorCode.INCORRECT_EMAIL));
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return next(new APIError(ErrorCode.INCORRECT_PASSWORD));
    }

    return apiJson({
      req,
      res,
      data: await generateAuthorizationResponse(user!, deviceId),
    });
  } catch (e) {
    return next(e);
  }
};

/**
 * Logout user
 * @public
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    startTimer({ req });

    const { device } = req.context;

    await Promise.all([Device.logout(device!.id), RefreshToken.removeDeviceById(device!.deviceId)]);

    return apiJson({ req, res, data: 'ok' });
  } catch (e) {
    return next(e);
  }
};

/**
 * Returns a new jwt and refresh tokens when given a valid refresh token
 * @public
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    startTimer({ req });

    const { uuid: deviceId, refreshToken: token } = req.body as {
      uuid: string;
      refreshToken: string;
    };

    const refreshToken = await RefreshToken.findOneAndRemove(deviceId, token);

    if (!refreshToken || !refreshToken.user) {
      return next(new APIError(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
    }

    return apiJson({
      req,
      res,
      data: await generateAuthorizationResponse(refreshToken.user, deviceId),
    });
  } catch (e) {
    return next(e);
  }
};
