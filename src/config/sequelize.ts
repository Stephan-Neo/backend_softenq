import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import pg from 'pg';

// Configs
import configVars from 'config/vars';

pg.defaults.parseInt8 = true;

export const configs: { [key: string]: SequelizeOptions } = {
  development: {
    ...configVars.sequelize,
    define: {
      underscored: false,
      freezeTableName: false,
      charset: 'utf8',
      timestamps: false,
    },
  },
  test: {
    ...configVars.sequelize,
    logging: false,
    define: {
      underscored: false,
      freezeTableName: false,
      charset: 'utf8',
      timestamps: false,
    },
  },
  production: {
    ...configVars.sequelize,
    logging: false,
    define: {
      underscored: false,
      freezeTableName: false,
      charset: 'utf8',
      timestamps: false,
    },
  },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class CustomDecimal extends DataTypes.DECIMAL {
  static parse(value: string): number {
    return parseFloat(value);
  }
}

export default (): Sequelize =>
  new Sequelize({
    ...configs[configVars.env],
    models: [`${__dirname}/../models`],
    modelMatch: (filename, member): boolean =>
      filename ===
      `${member
        .split(/(?=[A-Z])/)
        .join('-')
        .toLowerCase()}.model`,
    hooks: {
      afterConnect() {
        const dTypes = {
          DECIMAL: CustomDecimal,
        };

        (this as Sequelize).connectionManager.refreshTypeParser(dTypes);
      },
    },
  });
