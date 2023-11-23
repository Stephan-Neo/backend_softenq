import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default, ForeignKey,
  Model,
  PrimaryKey,
  BelongsTo,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';

// Interfaces
import { User } from 'models/user.model';

export enum IWalletTransformType {
  public = 'public',
  private = 'private',
}

@Table({
  timestamps: true,
})
export class Wallet extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @AllowNull(false)
  @Unique
  @Column
  address!: string;

  @AllowNull(true)
  @ForeignKey(() => User)
  @Default(null)
  @Column({
    type: DataType.UUID,
    onDelete: 'CASCADE',
  })
  userId!: string;

  @BelongsTo(() => User)
  user?: User;

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


  transform(type: IWalletTransformType = IWalletTransformType.public): IWallet {
    const wallet: IWallet = {
      id: this.id,
      address: this.address,
      userId: this.userId,
    };

    if ([IWalletTransformType.private].includes(type)) {
      wallet.createdAt = this.createdAt.toISOString();
      wallet.updatedAt = this.updatedAt.toISOString();
    }

    return wallet;
  }

  static updateWallet(id: string, wallet: { address?: string; userId?: string } = {}): Promise<boolean> {
    return this.update(
      {
        ...wallet,
      },
      {
        where: {
          id: id,
        },
        returning: false,
      }
    ).then(([count]) => count > 0);
  }
}

export interface IWallet {
  id: string;
  address: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
