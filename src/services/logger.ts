import { createLogger, transports, format } from 'winston';
import Transport from 'winston-transport';

// Configs
import configVars from 'config/vars';

const resultTransports: Transport[] = [
  new transports.Console({
    silent: configVars.env === 'test',
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf((info) => {
        // @ts-ignore
        const { timestamp, level, message, ...args } = info;

        const ts = timestamp.slice(0, 19).replace('T', ' ');

        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
      })
    ),
  }),
];

const logger = createLogger({
  transports: resultTransports,
  level: configVars.LOG_LEVEL,
  exitOnError: false,
});

export default {
  log: (...args: string[]): void => {
    logger.info(args.join(' '));
  },
  info: (...args: string[]): void => {
    logger.info(args.join(' '));
  },
  debug: (...args: string[]): void => {
    logger.debug(args.join(' '));
  },
  warn: (...args: string[]): void => {
    logger.warn(args.join(' '));
  },
  error: (...args: string[]): void => {
    logger.error(args.join(' '));
  },
};
