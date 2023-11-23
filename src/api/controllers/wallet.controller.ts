import { NextFunction, Request, Response } from 'express';

// Utils
import APIError, { ErrorCode } from 'utils/APIError';
import { apiJson, startTimer } from 'api/utils/ApiUtils';

// Models
import { IWalletTransformType, Wallet } from 'models/wallet.model';


export async function addWallet(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    startTimer({ req });
    const {
      userId,
      address
    } = req.body as {
      userId: string;
      address: string;
    };

    const findedWallet = await Wallet.findOne({
      where: {
        address: address,
      }
    })

    if (findedWallet) {
      return next(new APIError(ErrorCode.ALREADY_EXISTS));
    }

    const wallet = await Wallet.create({
      address,
      userId,
    });

    return apiJson({
      req,
      res,
      data: wallet!.transform(IWalletTransformType.private),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getWallet(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    startTimer({ req });
    const {
      userId,
    } = req.query as {
      userId: string;
    };

    const findedWallet = await Wallet.findOne({
      where: {
        userId: userId,
      }
    })

    if (!findedWallet) {
      return next(new APIError(ErrorCode.NOT_FOUND));
    }

    return apiJson({
      req,
      res,
      data: findedWallet!.transform(IWalletTransformType.private),
    });
  } catch (error) {
    return next(error);
  }
}