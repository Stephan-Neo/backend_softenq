import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Sequelize } from 'sequelize-typescript';

// Utils
import { endTimer, startTimer } from 'api/utils/ApiUtils';

interface TestResult {
  status: 'success' | 'fail';
  runtime?: number;
  runtimeAvg?: number;
}

const testDb = async (sequelize: Sequelize): Promise<TestResult> => {
  try {
    const key = 'healthcheck-db';

    startTimer({ key });

    await sequelize.authenticate();

    const response: TestResult = {
      status: 'success',
    };

    const timer = endTimer({ key });
    if (timer) {
      response.runtime = timer.last;
      response.runtimeAvg = timer.avg;
    }

    return response;
  } catch (error) {
    return {
      status: 'fail',
    };
  }
};

export default (sequelize: Sequelize): RequestHandler =>
  async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ): Promise<void> => {
    const dbResult = await testDb(sequelize);

    res.status(dbResult.status === 'success' ? 200 : 500).json({ uptime: process.uptime(), db: dbResult });
  };
