import { v4 as uuid } from 'uuid';
import express, { Express, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import helmet from 'helmet';
import { Sequelize } from 'sequelize-typescript';

// Middlewares
import healthcheck from 'api/middlewares/healthcheck';
import logger from 'api/middlewares/logger';
import { converter, handler, notFound } from 'api/middlewares/error';

// Configs
import configVars from 'config/vars';

import routes from 'api/routes';

/**
 * Express instance
 * @public
 */
export default (sequelize: Sequelize): Express => {
  const app = express();

  // request logging. dev: console | production: file
  app.use(morgan(configVars.logs));

  // parse body params and attache them to req.body
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // gzip compression
  app.use(compress());

  // lets you use HTTP verbs such as PUT or DELETE
  // in places where the client doesn't support it
  app.use(methodOverride());

  // secure apps by setting various HTTP headers
  app.use(helmet());

  // enable CORS - Cross Origin Resource Sharing
  app.use(cors());

  // --- NOTE: for testing in DEV, allow Access-Control-Allow-Origin: (ref: https://goo.gl/pyjO1H)
    app.all('/*', function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
    });

  app.use((req: Request & { uuid: string }, res: Response, next: NextFunction) => {
    req.uuid = `uuid_${uuid()}`;
    next();
  });

  // logger
  app.use(logger);

  // health check
  app.use('/healthcheck', healthcheck(sequelize));

  // mount api routes
  app.use(routes);

  // if error is not an instanceOf APIError, convert it.
  app.use(converter);

  // catch 404 and forward to error handler
  app.use(notFound);

  // error handler, send stacktrace only during development
  app.use(handler);

  return app;
};
