import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import moment from 'moment-timezone';
import crypto from 'crypto';

// Configs
import configVars from 'config/vars';

// Models
import { User } from 'models/user.model';

@Table({
  timestamps: true,
})
export class RefreshToken extends Model {
  @AllowNull(false)
  @CreatedAt
  @Default(DataType.NOW)
  @Column
  createdAt!: Date;

  @AllowNull(false)
  @UpdatedAt
  @Default(DataType.NOW)
  @Column
  updatedAt!: Date;

  @AllowNull(false)
  @Column(DataType.TEXT)
  token!: string;

  @AllowNull(false)
  @Unique
  @Column
  deviceId!: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    onDelete: 'CASCADE',
  })
  userId!: string;

  @BelongsTo(() => User)
  user?: User;

  @AllowNull(false)
  @Column
  expires!: Date;

  static async generate(userId: string, deviceId: string): Promise<RefreshToken> {
    const token = `${userId}.${deviceId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment().add(configVars.REFRESH_TOKEN_EXPIRATION_MINUTES, 'minutes').toDate();

    await this.destroy({
      where: {
        [Op.or]: [
          {
            deviceId,
          },
          {
            userId,
          },
        ],
      },
    });

    return this.create({
      token,
      userId,
      deviceId,
      expires,
    });
  }

  static async removeDeviceById(deviceId: string): Promise<boolean> {
    return this.destroy({
      where: {
        deviceId,
      },
    }).then((count) => count > 0);
  }

  static async removeAllUserTokens(userId: string): Promise<boolean> {
    return this.destroy({
      where: {
        userId,
      },
    }).then((count) => count > 0);
  }

  static async findOneAndRemove(deviceId: string, token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.findOne({
      where: {
        deviceId,
        token,
        expires: {
          [Op.gte]: new Date(),
        },
      },
    });

    if (refreshToken) {
      await this.destroy({
        where: {
          id: refreshToken.id,
        },
      });
    }

    return refreshToken;
  }

  static removeExpiredRefreshTokens(): Promise<boolean> {
    return this.destroy({
      where: {
        expires: {
          [Op.lt]: new Date(),
        },
      },
    }).then((count) => count > 0);
  }
}
