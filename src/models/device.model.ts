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

// Services
import { generate as jwtGenerate, verify as jwtVerify } from 'services/jwt';

// Utils
import { upsert } from 'utils/ModelUtils';

// Configs
import configVars from 'config/vars';

// Models
import { User } from 'models/user.model';

@Table({
  timestamps: true,
})
export class Device extends Model {
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
  @Column
  deviceId!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.TEXT)
  accessToken!: string;

  @AllowNull(false)
  @Column
  accessTokenExpires!: Date;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    onDelete: 'CASCADE',
  })
  userId!: string;

  @BelongsTo(() => User)
  user?: User;

  static async generateAccessToken(userId: string, deviceId: string): Promise<Device> {
    const accessTokenExpires = moment().add(configVars.JWT_EXPIRATION_MINUTES, 'minutes').toDate();
    const accessToken = jwtGenerate(userId, deviceId, accessTokenExpires);

    const usedDevices = await this.findAll({
      where: {
        deviceId,
        userId: {
          [Op.ne]: userId,
        },
      },
    });

    if (usedDevices.length) {
      await this.destroy({
        where: {
          id: usedDevices.map((device) => device.id),
        },
      });
    }

    return upsert<Device>(
      this,
      {
        accessToken,
        accessTokenExpires,
      },
      {
        userId,
        deviceId,
      }
    );
  }

  static async findUserDeviceByAccessToken(accessToken: string): Promise<Device | null> {
    const data = jwtVerify(accessToken);

    if (!data) {
      return null;
    }

    const { userId, deviceId } = data;

    return this.findOne({
      where: {
        userId,
        deviceId,
        accessToken,
        accessTokenExpires: {
          [Op.gte]: new Date(),
        },
      },
      include: [User],
    });
  }

  static async logout(id: string): Promise<boolean> {
    return this.destroy({
      where: {
        id,
      },
    }).then((count) => count > 0);
  }

  static removeExpiredDevices(): Promise<boolean> {
    return this.destroy({
      where: {
        accessTokenExpires: {
          [Op.lt]: new Date(),
        },
      },
    }).then((count) => count > 0);
  }
}
