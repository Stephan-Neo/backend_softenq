import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Config
import configVars from 'config/vars';

// Utils
import APIError, { ErrorCode } from 'utils/APIError';
import { apiJson, startTimer } from 'api/utils/ApiUtils';

// Services
import { deleteValue, getValue, setValueWithExp } from 'services/redis';
import { sendConfirmEmailUrl, sendPasswordRecoverylUrl } from 'services/mailer';

// Models
import { IUser, IUserTransformType, User } from 'models/user.model';
import { Device } from 'models/device.model';
import { RefreshToken } from 'models/refresh-token.model';
import { UserRole, IRedisEmail } from 'interfaces/user';

const EXPIRATION_INVITE_SECONDS = 86400;

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

    const confirm_email: IRedisEmail = { email };

    const rounds = configVars.env === 'test' ? 1 : 10;
    const redisKey = bcrypt.hashSync(JSON.stringify({ ...confirm_email, date: Date.now() }), rounds);

    setValueWithExp(redisKey, { confirm_email }, EXPIRATION_INVITE_SECONDS);
    await sendConfirmEmailUrl(email, redisKey, name);

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
export async function confirmEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    startTimer({ req });

    const { hash } = req.query as {
      hash: string;
    };

    const redisEmail = await getValue<{ confirm_email: IRedisEmail }>(hash);
    if (!redisEmail) {
      return next(new APIError(ErrorCode.FORBIDDEN));
    }

    await deleteValue(hash);

    const { email } = redisEmail.confirm_email;

    const user = await User.findUserByEmail(email)

    if (!user) {
      return next(new APIError(ErrorCode.INCORRECT_EMAIL));
    }

    await User.updateProfile(user!.id, { confirmEmail: true });

    const update_user = await User.findUserByEmail(email)

    return apiJson({
      req,
      res,
      data: update_user!.transform(IUserTransformType.private),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Password Recovery
 * @public
 */
export async function passwordRecovery(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    startTimer({ req });
    const {
      email,
    } = req.body as {
      email: string;
    };

    const user = await User.findUserByEmail(email);

    if (!user) {
      return next(new APIError(ErrorCode.INCORRECT_EMAIL));
    }

    const recovery_email: IRedisEmail = { email };
    const rounds = configVars.env === 'test' ? 1 : 10;
    const redisKey = bcrypt.hashSync(JSON.stringify({ ...recovery_email, date: Date.now() }), rounds);

    setValueWithExp(redisKey, { recovery_email }, EXPIRATION_INVITE_SECONDS);
    await sendPasswordRecoverylUrl(email, redisKey, user.name);

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
 * Update Password
 * @public
 */
export async function updatePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    startTimer({ req });

    const { hash } = req.query as {
      hash: string;
    };

    const {
      password,
    } = req.body as {
      password: string;
    };

    const redisEmail = await getValue<{ recovery_email: IRedisEmail }>(hash);
    if (!redisEmail) {
      return next(new APIError(ErrorCode.FORBIDDEN));
    }

    await deleteValue(hash);

    const { email } = redisEmail.recovery_email;
    const rounds = configVars.env === 'test' ? 1 : 10;
    const pass = bcrypt.hashSync(password, rounds);

    const user = await User.findUserByEmail(email)

    if (!user) {
      return next(new APIError(ErrorCode.INCORRECT_EMAIL));
    }

    await User.updateProfile(user!.id, { password: pass });

    const update_user = await User.findUserByEmail(email)

    return apiJson({
      req,
      res,
      data: update_user!.transform(IUserTransformType.private),
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

    if (!user.confirmEmail) {
      return next(new APIError(ErrorCode.FORBIDDEN));
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
