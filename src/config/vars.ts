import 'dotenv/config';
import { SequelizeOptions } from 'sequelize-typescript';

const envs = process.env; // this has ".env" keys & values

export default {
  env: envs.NODE_ENV || 'development',
  port: envs.PORT || 3010,
  FRONTEND_URL: <string>envs.FRONTEND_URL,
  sequelize: <SequelizeOptions>{
    dialect: 'postgres',
    host: <string>envs.PG_HOST,
    username: <string>envs.PG_USER,
    password: <string>envs.PG_PASS,
    database: <string>envs.PG_DB,
    port: <number>Number(envs.PG_PORT || 5432),
  },

  REDIS_URL: <string>envs.REDIS_URL,

  logs: envs.NODE_ENV === 'production' ? 'combined' : 'dev',
  LOG_LEVEL: <string>envs.LOG_LEVEL || 'info',
  LOG_TRANSPORT: <boolean>(envs.LOG_TRANSPORT !== 'false'),
  SWAGGER_ENABLED: <boolean>((envs.SWAGGER_ENABLED || 'false') !== 'false'),

  JWT_SECRET: <string>envs.JWT_SECRET || 'secret',
  JWT_EXPIRATION_MINUTES: <number>Number(envs.JWT_EXPIRATION_MINUTES || 1440),
  REFRESH_TOKEN_EXPIRATION_MINUTES: <number>Number(envs.REFRESH_TOKEN_EXPIRATION_MINUTES || 43200),

  SMTP_HOST: <string>envs.SMTP_HOST,
  SMTP_PORT: <number>Number(envs.SMTP_PORT),
  SMTP_USER: <string>envs.SMTP_USER,
  SMTP_PASSWORD: <string>envs.SMTP_PASSWORD,
};
