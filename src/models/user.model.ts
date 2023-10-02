import {
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  Column,
  CreatedAt,
  DataType,
  Default,
  Length,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

// Configs
import configVars from 'config/vars';

// Interfaces
import { UserRole } from 'interfaces/user';

export enum IUserTransformType {
  public = 'public',
  private = 'private',
}

@Table({
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

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
  @Unique
  @Column
  email!: string;

  @AllowNull(false)
  @Column
  password!: string;

  @AllowNull(false)
  @Length({
    min: 3,
    max: 48,
  })
  @Column(DataType.STRING(48))
  name!: string;

  @AllowNull(true)
  @Length({
    min: 6,
    max: 11,
  })
  @Column
  phone: string;

  @AllowNull(false)
  @Default(UserRole.USER)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  role!: UserRole;

  @BeforeCreate
  @BeforeUpdate
  static generateHash(instance: User): void {
    if (instance.password?.trim().length) {
      const rounds = configVars.env === 'test' ? 1 : 10;
      // eslint-disable-next-line no-param-reassign
      instance.password = bcrypt.hashSync(instance.password, rounds);
    }
  }

  transform(type: IUserTransformType = IUserTransformType.public): IUser {
    const profile: IUser = {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
    };

    if ([IUserTransformType.private].includes(type)) {
      profile.createdAt = this.createdAt.toISOString();
      profile.updatedAt = this.updatedAt.toISOString();
    }

    return profile;
  }

  static updateProfile(userId: string, profile: { firstName?: string; lastName?: string } = {}): Promise<boolean> {
    return this.update(
      {
        ...profile,
      },
      {
        where: {
          id: userId,
        },
        returning: false,
      }
    ).then(([count]) => count > 0);
  }

  static findUserByPk(id: string, options: { withoutScopes?: boolean } = {}): Promise<User | null> {
    const { withoutScopes = false } = options;

    return (withoutScopes ? this.unscoped() : this).findByPk(id);
  }

  static findUserByEmail(email: string, options: { withoutScopes?: boolean } = {}): Promise<User | null> {
    const { withoutScopes = false } = options;

    return (withoutScopes ? this.unscoped() : this).findOne({
      where: {
        email,
      },
    });
  }
}

export interface IUser {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  name: string;
}
